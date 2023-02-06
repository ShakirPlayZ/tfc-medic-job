import * as alt from 'alt-client';
import { AthenaClient } from '../../../client/api/athena';
import { TfcMedicWebViewEvents } from '../shared/viewInfo';

let players: alt.Player[];

class TfcMedicWebView {
    /**
     * Opens the WebView.
     * The function call is from the server-side.
     *
     * @static
     * @param {alt.Player[]} _players
     * @return {*}
     * @memberof ExampleWebView
     */
    static open(_players: alt.Player[]) {
        players = _players;
        if (AthenaClient.webview.isAnyMenuOpen(true)) {
            return;
        }

        AthenaClient.webview.ready(TfcMedicWebViewEvents.ViewName, TfcMedicWebView.ready);
        AthenaClient.webview.open([TfcMedicWebViewEvents.ViewName], true, TfcMedicWebView.close);
        AthenaClient.webview.focus();
        AthenaClient.webview.showCursor(true);
        alt.toggleGameControls(false);
        alt.Player.local.isMenuOpen = true;
    }

    /**
     * A ready event to send the data up to the WebView.
     *
     * @static
     * @memberof ExampleWebView
     */
    static ready() {
        AthenaClient.webview.emit(TfcMedicWebViewEvents.ClientToWebView.LOAD_PLAYERS, players);
    }

    /**
     * Called when the WebView event is closed.
     *
     * @static
     * @memberof ExampleWebView
     */
    static close() {
        players = undefined;
        AthenaClient.webview.unfocus();
        AthenaClient.webview.showCursor(false);
        alt.toggleGameControls(true);
        alt.Player.local.isMenuOpen = false;
    }
}

alt.onServer(TfcMedicWebViewEvents.ClientServer.OPEN, TfcMedicWebView.open);
