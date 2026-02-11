export interface DnsProvider {
    id: string;
    name: string;
    description: string;
    primary: string;
    secondary: string;
    isAutomatic: boolean;
}

export type DnsInfo = {
    interface_name: string;
    servers: string[];
    is_automatic: boolean;
};

export type CommandResult = {
    success: boolean;
    message: string;
};
