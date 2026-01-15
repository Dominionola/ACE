import { google } from "googleapis";

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

// Scopes required for Google Drive access
const SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
];

// Create OAuth2 client
export function createOAuth2Client() {
    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );
}

// Generate the Google OAuth URL for user authorization
export function getGoogleAuthUrl(state?: string): string {
    const oauth2Client = createOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: "offline", // Required to get refresh token
        scope: SCOPES,
        prompt: "consent", // Force consent to always get refresh token
        state: state || "",
    });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
    const oauth2Client = createOAuth2Client();

    try {
        const { tokens } = await oauth2Client.getToken(code);
        return { success: true, tokens };
    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        return { success: false, error: "Failed to exchange authorization code" };
    }
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        return { success: true, tokens: credentials };
    } catch (error) {
        console.error("Error refreshing token:", error);
        return { success: false, error: "Failed to refresh access token" };
    }
}

// Get user's Google email from token
export async function getGoogleUserEmail(accessToken: string): Promise<string | null> {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    try {
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        return data.email || null;
    } catch (error) {
        console.error("Error getting user email:", error);
        return null;
    }
}

// List PDF files from user's Google Drive
export async function listDrivePDFs(accessToken: string) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    try {
        const response = await drive.files.list({
            q: "mimeType='application/pdf' and trashed=false",
            fields: "files(id, name, size, modifiedTime, webViewLink, iconLink)",
            orderBy: "modifiedTime desc",
            pageSize: 50,
        });

        return {
            success: true,
            files: response.data.files || [],
        };
    } catch (error) {
        console.error("Error listing Drive files:", error);
        return { success: false, error: "Failed to list files", files: [] };
    }
}

// Download file content from Google Drive
export async function downloadDriveFile(accessToken: string, fileId: string): Promise<{ success: boolean; content?: Buffer; error?: string }> {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    try {
        const response = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "arraybuffer" }
        );

        return {
            success: true,
            content: Buffer.from(response.data as ArrayBuffer),
        };
    } catch (error) {
        console.error("Error downloading file:", error);
        return { success: false, error: "Failed to download file" };
    }
}

// Get file metadata from Google Drive
export async function getDriveFileMetadata(accessToken: string, fileId: string) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    try {
        const response = await drive.files.get({
            fileId,
            fields: "id, name, size, mimeType, modifiedTime",
        });

        return { success: true, file: response.data };
    } catch (error) {
        console.error("Error getting file metadata:", error);
        return { success: false, error: "Failed to get file metadata" };
    }
}
