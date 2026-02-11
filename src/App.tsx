import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Layout } from "./layouts/Layout";
import { ActiveDnsStatus } from "./components/ActiveDnsStatus";
import { DnsProfileCard } from "./components/DnsProfileCard";
import { CustomDnsInput } from "./components/CustomDnsInput";
import { Toast, ToastMessage } from "./components/Toast";
import { DnsProvider, DnsInfo } from "./types";
import { RotateCw, AlertTriangle } from "lucide-react";

const PROVIDERS: DnsProvider[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    description: "Hız ve gizlilik",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    isAutomatic: false
  },
  {
    id: "google",
    name: "Google DNS",
    description: "Güvenilir",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    isAutomatic: false
  },
  {
    id: "quad9",
    name: "Quad9",
    description: "Zararlı yazılım koruması",
    primary: "9.9.9.9",
    secondary: "149.112.112.112",
    isAutomatic: false
  },
  {
    id: "opendns",
    name: "OpenDNS",
    description: "Aile koruması",
    primary: "208.67.222.222",
    secondary: "208.67.220.220",
    isAutomatic: false
  }
];

interface DnsChangedPayload {
  success: boolean;
  message: string;
}

function App() {
  const [currentDns, setCurrentDns] = useState<DnsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const fetchDnsInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await invoke<DnsInfo>("get_current_dns");
      setCurrentDns(info);
    } catch (err) {
      console.error("DNS bilgisi alınamadı:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAdminStatus = useCallback(async () => {
    try {
      const admin = await invoke<boolean>("check_admin");
      setIsAdmin(admin);
    } catch (e) {
      console.error("Admin check failed", e);
    }
  }, []);

  useEffect(() => {
    checkAdminStatus();
    fetchDnsInfo();

    // Listen for DNS changes from system tray
    const unlistenDns = listen<DnsChangedPayload>("dns-changed", (event) => {
      const { success, message } = event.payload;
      showToast(message, success ? 'success' : 'error');
      // Re-fetch after a short delay to let the OS apply the change
      setTimeout(() => {
        fetchDnsInfo();
      }, 800);
    });

    // Re-fetch DNS info when window regains focus (e.g. after being hidden to tray)
    const appWindow = getCurrentWindow();
    const unlistenFocus = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        fetchDnsInfo();
      }
    });

    return () => {
      unlistenDns.then(f => f());
      unlistenFocus.then(f => f());
    };
  }, [checkAdminStatus, fetchDnsInfo, showToast]);

  const handleApplyProvider = async (provider: DnsProvider) => {
    setIsLoading(true);

    try {
      // 1. Optimistic Update
      setCurrentDns({
        interface_name: currentDns?.interface_name || "Ağ",
        servers: provider.isAutomatic ? [] : [provider.primary, provider.secondary || ""],
        is_automatic: provider.isAutomatic
      });

      if (provider.isAutomatic) {
        await invoke("reset_dns");
      } else {
        await invoke("set_dns", {
          primary: provider.primary,
          secondary: provider.secondary
        });
      }

      showToast(`${provider.name} başarıyla uygulandı!`, 'success');

      // 2. Delayed Verification
      setTimeout(() => {
        fetchDnsInfo();
      }, 1000);

    } catch (err) {
      console.error("DNS değiştirilemedi:", err);
      showToast("Yönetici yetkisi gerekiyor!", 'error');
      fetchDnsInfo();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDns = async () => {
    setIsLoading(true);
    try {
      setCurrentDns({
        interface_name: currentDns?.interface_name || "Ağ",
        servers: [],
        is_automatic: true
      });

      await invoke("reset_dns");
      showToast("Sistem varsayılanına dönüldü!", 'success');

      setTimeout(() => {
        fetchDnsInfo();
      }, 1000);

    } catch (err) {
      console.error("Sıfırlama hatası:", err);
      showToast("Sıfırlama başarısız: Yönetici olmalısın", 'error');
      fetchDnsInfo();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCustom = async (primary: string, secondary: string) => {
    setIsLoading(true);
    try {
      setCurrentDns({
        interface_name: currentDns?.interface_name || "Ağ",
        servers: [primary, secondary],
        is_automatic: false
      });

      await invoke("set_dns", { primary, secondary });
      showToast("Özel DNS başarıyla uygulandı!", 'success');

      setTimeout(() => {
        fetchDnsInfo();
      }, 1000);

    } catch (err) {
      console.error("Özel DNS ayarlanamadı:", err);
      showToast("Özel DNS ayarlanamadı", 'error');
      fetchDnsInfo();
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveProviderId = (): string | null => {
    if (!currentDns) return null;
    if (currentDns.is_automatic) return "default";

    const primary = currentDns.servers[0];
    const match = PROVIDERS.find(p => p.primary === primary);
    return match ? match.id : "custom";
  };

  const activeProviderId = getActiveProviderId();
  const isDefaultActive = activeProviderId === "default";

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50/50 overflow-hidden relative">

        {/* Admin Warning Banner */}
        {!isAdmin && (
          <div className="bg-red-500 text-white text-[10px] font-bold py-1.5 px-3 flex items-center justify-center gap-2 animate-pulse shadow-md z-50 sticky top-0">
            <AlertTriangle size={12} className="shrink-0" />
            <span>Yönetici izni yok! DNS değiştirmek için yönetici olarak çalıştırın.</span>
          </div>
        )}

        <div className="p-3 pb-0 shrink-0">
          <div className="mb-3">
            <ActiveDnsStatus
              interfaceName={currentDns?.interface_name || "Ağ"}
              servers={currentDns?.servers || []}
              isAutomatic={currentDns?.is_automatic || false}
              isLoading={isLoading}
              onRefresh={fetchDnsInfo}
            />
          </div>
        </div>

        {/* Profile Grid - Scrollable Area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-2 custom-scrollbar space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((provider) => (
              <DnsProfileCard
                key={provider.id}
                provider={provider}
                isActive={activeProviderId === provider.id}
                isLoading={isLoading}
                onSelect={handleApplyProvider}
              />
            ))}
          </div>

          <button
            onClick={handleResetDns}
            disabled={isLoading || isDefaultActive}
            className={`
                  w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-all
                  ${isDefaultActive
                ? 'bg-gray-100 text-muted/50 border-transparent cursor-default'
                : 'bg-white border-border hover:bg-gray-50 hover:border-gray-300 text-text shadow-sm'
              }
              `}
          >
            <RotateCw size={14} className={isLoading && !activeProviderId ? "animate-spin" : ""} />
            {isDefaultActive ? "Sistem Varsayılanı (Aktif)" : "Sistem Varsayılanına Dön (DHCP)"}
          </button>
        </div>

        {/* Custom Input - Sticky Bottom */}
        <div className="shrink-0 mt-auto bg-white border-t border-border p-3 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <CustomDnsInput onApply={handleApplyCustom} isLoading={isLoading} />
          <div className="text-center text-[10px] text-muted/40 mt-2">
            sc0x01.com DNS Degistirici v1.0
          </div>
        </div>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </Layout>
  );
}

export default App;
