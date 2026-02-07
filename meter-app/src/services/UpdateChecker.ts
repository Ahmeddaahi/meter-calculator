import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export interface UpdateInfo {
    latestVersion: string;
    apkUrl: string;
    releaseNotes?: string;
}

export const checkAppUpdate = async (updateUrl: string): Promise<UpdateInfo | null> => {
    try {
        const response = await fetch(updateUrl);
        if (!response.ok) return null;

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null;
        }

        const data: UpdateInfo = await response.json();

        const currentVersion = Constants.expoConfig?.version || '1.0.0';

        if (isVersionOutdated(currentVersion, data.latestVersion)) {
            return data;
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
    return null;
};

const isVersionOutdated = (current: string, latest: string): boolean => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        const curr = currentParts[i] || 0;
        const late = latestParts[i] || 0;
        if (late > curr) return true;
        if (late < curr) return false;
    }
    return false;
};

export const downloadUpdate = (apkUrl: string) => {
    Linking.openURL(apkUrl);
};
