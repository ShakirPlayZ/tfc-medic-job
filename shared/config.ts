export const TFC_MEDIC_JOB_CONFIG = {
    //SET PERMISSIONS FOR COMMAND ACCESS HERE
    //CHECK IF PLAYER IS IN ONE OF THE FACTIONS IN FACTION_LIST
    CHECK_FACTIONS: true,
    FACTION_LIST: [
        { name: 'LSMD' }
    ],
    //CHECK SERVER PERMISSION
    CHECK_PERMISSIONS: true,
    PERMISSION_LIST: [
        { name: 'MODERATOR', level: 2 },
        { name: 'ADMIN', level: 4 },
    ],
}
