export const TfcMedicWebViewEvents = {
    ViewName: 'TfcMedicWebView', // This needs to match the `.vue` file name.
    ClientServer: {
        OPEN: 'TfcMedicWebView:webview:event:open',
        CLOSE: 'TfcMedicWebView:webview:event:close',
    },
    ClientToWebView: {
        LOAD_PLAYERS: 'TfcMedicWebView:webview:event:loadplayers',
    },
    ServerToWebView: {
        REFRESH_PLAYERS: 'TfcMedicWebView:webview:event:refreshplayers',
    },
    WebViewToServer: {
        KICK_PLAYER: 'TfcMedicWebView:webview:event:kick',
        REQUEST_REFRESH: 'TfcMedicWebView:webview:event:requestrefresh',
    },
};
