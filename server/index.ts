import alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { TfcMedicWebViewServer } from './src/view';

const PLUGIN_NAME = 'TFC Medic Plugin';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    TfcMedicWebViewServer.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} Loaded.`);
});
