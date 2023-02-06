import * as alt from 'alt-server';
import { Athena } from '@AthenaServer/api/athena';
import { command } from '@AthenaServer/decorators/commands';
import {CHARACTER_PERMISSIONS, PERMISSIONS} from '@AthenaShared/flags/permissionFlags';
import { isFlagEnabled } from '@AthenaShared/utility/flags';
import { TfcMedicWebViewEvents } from '../../shared/viewInfo';
import {TFCMEDIC_EVENTS} from "./events";
import {ANIMATION_FLAGS} from "@AthenaShared/flags/animationFlags";
import sync from "@AthenaClient/extensions/vehicleFuncs/sync";
import {LocaleController} from "@AthenaShared/locale/locale";
import {LOCALE_KEYS} from "@AthenaShared/locale/languages/keys";

const InternalFuncs = {
    reanimateplayer(player: alt.Player, id: string) {
        alt.log("REANIMATE player: ", player.name);
        alt.log("REANIMATE target: ", id);

        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (!target.data.isDead) {
            return;
        }
        Athena.player.set.respawned(target, target.pos);
    },
    heal25player(player: alt.Player, id: string){
        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (target.data.isDead) {
            return;
        }
        alt.log("heal25player id: ", id);
        alt.log("heal25player target: ", target.name);

        Athena.player.safe.addHealth(target, 25, false);
    },
    heal50player(player: alt.Player, id: string){
        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (target.data.isDead) {
            return;
        }
        alt.log("heal50player id: ", id);
        alt.log("heal50player target: ", target.name);

        Athena.player.safe.addHealth(target, 50, false);
    }
}

export class TfcMedicWebViewServer {
    static init() {
        console.log(`Commands for TFC Medic Job Created`);
        alt.onClient(TfcMedicWebViewEvents.WebViewToServer.KICK_PLAYER, TfcMedicWebViewServer.handleKickPlayer);
        alt.onClient(TfcMedicWebViewEvents.WebViewToServer.REQUEST_REFRESH, TfcMedicWebViewServer.handleRefresh);

        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.REANIMATEPLAYER, InternalFuncs.reanimateplayer);
        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.HEAL25PLAYER, InternalFuncs.heal25player);
        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.HEAL50PLAYER, InternalFuncs.heal50player);
    }

    @command('medicjob', '/medicjob - Job Menü anzeigen', PERMISSIONS.ADMIN | PERMISSIONS.MODERATOR | CHARACTER_PERMISSIONS.LSMD)
    static handleCommand(player: alt.Player) {
        alt.emitClient(player, TfcMedicWebViewEvents.ClientServer.OPEN, TfcMedicWebViewServer.getAvailablePlayers());
    }

    private static handleRefresh(player: alt.Player) {
        console.log('got refresh event');

        Athena.webview.emit(
            player,
            TfcMedicWebViewEvents.ServerToWebView.REFRESH_PLAYERS,
            TfcMedicWebViewServer.getAvailablePlayers(),
        );
    }

    private static handleKickPlayer(player: alt.Player, idToKick: number) {
        if (!isFlagEnabled(player.accountData.permissionLevel, PERMISSIONS.ADMIN)) {
            return;
        }

        const target = Athena.systems.identifier.getPlayer(idToKick);
        if (!target || !target.valid) {
            return;
        }

        target.kick(`Kicked by Example Panel`);
        TfcMedicWebViewServer.handleRefresh(player);
    }

    private static getAvailablePlayers(): Array<any> {
        return [...alt.Player.all]
        .filter((x) => x.valid && x.data && x.data._id)
        .map((t) => {
            const id = Athena.systems.identifier.getIdByStrategy(t);
            return {
                id,
                name: t.data.name,
                ping: t.ping,
            };
        });
    }
}
