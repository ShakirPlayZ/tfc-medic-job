import * as alt from 'alt-server';
import { Athena } from '@AthenaServer/api/athena';
import { command } from '@AthenaServer/decorators/commands';
import { PERMISSIONS } from '@AthenaShared/flags/permissionFlags';
import { isFlagEnabled } from '@AthenaShared/utility/flags';
import { TfcMedicWebViewEvents } from '../../shared/viewInfo';
import { TFCMEDIC_EVENTS } from './events';
import { LocaleController } from '@AthenaShared/locale/locale';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys';
import { TFC_MEDIC_JOB_CONFIG } from '../../shared/config';
import { FactionHandler } from '../../../athena-plugin-factions/server/src/handler';

const InternalFuncs = {
    reanimateplayer(player: alt.Player, id: string) {
        alt.log('REANIMATE player: ', player.name);
        alt.log('REANIMATE target: ', id);

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
    heal25player(player: alt.Player, id: string) {
        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (target.data.isDead) {
            return;
        }
        alt.log('heal25player id: ', id);
        alt.log('heal25player target: ', target.name);

        Athena.player.safe.addHealth(target, 25, false);
    },
    heal50player(player: alt.Player, id: string) {
        const target = Athena.systems.identifier.getPlayer(id);
        if (!target) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
            return;
        }
        if (target.data.isDead) {
            return;
        }
        alt.log('heal50player id: ', id);
        alt.log('heal50player target: ', target.name);

        Athena.player.safe.addHealth(target, 50, false);
    },
};

export class TfcMedicWebViewServer {
    static init() {
        console.log(`Commands for TFC Medic Job Created`);
        alt.onClient(TfcMedicWebViewEvents.WebViewToServer.KICK_PLAYER, TfcMedicWebViewServer.handleKickPlayer);
        alt.onClient(TfcMedicWebViewEvents.WebViewToServer.REQUEST_REFRESH, TfcMedicWebViewServer.handleRefresh);

        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.REANIMATEPLAYER, InternalFuncs.reanimateplayer);
        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.HEAL25PLAYER, InternalFuncs.heal25player);
        alt.onClient(TFCMEDIC_EVENTS.TO_SERVER.HEAL50PLAYER, InternalFuncs.heal50player);
    }

    static checkConfigPermissions(player: alt.Player): boolean {
        alt.logWarning('tfc-medic-job: Checking Permissions...');
        let playerFaction = FactionHandler.get(player.data.faction) ? FactionHandler.get(player.data.faction).name : '';
        let playerIsInFaction = TFC_MEDIC_JOB_CONFIG.FACTION_LIST.find((fl) => fl.name === playerFaction)
            ? true
            : false;
        let playerPermission = player.accountData.permissionLevel;
        let playerHasPermission = TFC_MEDIC_JOB_CONFIG.PERMISSION_LIST.find((pl) => pl.level === playerPermission)
            ? true
            : false;

        if (TFC_MEDIC_JOB_CONFIG.CHECK_FACTIONS && !playerIsInFaction) {
            Athena.player.emit.notification(player, 'You ~r~dont have permission~w~ to perform this action (Faction)');
            alt.logWarning('tfc-medic-job: Faction is false');
            return false;
        } else if (TFC_MEDIC_JOB_CONFIG.CHECK_PERMISSIONS && !playerHasPermission) {
            Athena.player.emit.notification(
                player,
                'You ~r~dont have permission~w~ to perform this action (Permission)',
            );
            alt.logWarning('tfc-medic-job: Permission is false');
            return false;
        }

        alt.logWarning('tfc-medic-job: Player has Permission');
        return true;
    }

    @command('medicjob', '/medicjob - Job Menü anzeigen', PERMISSIONS.NONE)
    static handleCommand(player: alt.Player) {
        if (TfcMedicWebViewServer.checkConfigPermissions(player)) {
            alt.emitClient(
                player,
                TfcMedicWebViewEvents.ClientServer.OPEN,
                TfcMedicWebViewServer.getAvailablePlayers(),
            );
        }
    }

    private static handleRefresh(player: alt.Player) {
        //console.log('got refresh event');

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
