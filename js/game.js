const MAP_SIZE = { width: 1448, height: 1086 };
const MIN_MAP_ZOOM = 1;
const MAX_MAP_ZOOM = 4.2;
    const TURN_DAYS = 5;
    const SAVE_KEY = 'luanshi_zhiqi_v4';
    const SAVE_KEY_BACKUP = 'luanshi_zhiqi_v4_backup';
    const AUTH_SESSION_KEY = 'luanshi_zhiqi_auth_session_v1';
    const BACKEND_SESSION_KEY = 'sanguo_backend_session_v1';
    const BACKEND_SAVE_SLOT = 'default';
    let bgMusicPlaying = false; // Starts after entering a game flow.
    let bgmPlaybackToken = 0;
    const BACKEND_API_BASE_URL = window.SANGUO_API_BASE_URL || (window.location.protocol === 'file:' ? 'http://localhost:3001' : '');
    const GAME_SCHEMA_VERSION = 6;
    const MAP_EDITOR_STORAGE_KEY = 'sg-map-editor-data:v1';
    const storageLoadDiagnostics = [];
    window.storageLoadDiagnostics = storageLoadDiagnostics;

    // ---- 远程 LLM 适配器防替换 ----
    let _remoteLLMAdapter = null;
    Object.defineProperty(window, 'remoteLLMAdapter', {
      get() { return _remoteLLMAdapter; },
      configurable: false
    });
    window.__initLLMAdapter = function (adapter) { _remoteLLMAdapter = adapter; };
    Object.defineProperty(window, '__initLLMAdapter', { writable: false, configurable: false });

    const FACTIONS = {
      player: { id: 'player', name: '玩家', color: '#9062c8', short: '你' },
      yuan: { id: 'yuan', name: '袁绍', color: '#c59b4c', short: '袁' },
      cao: { id: 'cao', name: '曹操', color: '#3f79b8', short: '曹' },
      gongsun: { id: 'gongsun', name: '公孙瓒', color: '#6450a0', short: '公' },
      liu: { id: 'liu', name: '刘备', color: '#5f9160', short: '刘' },
      liubiao: { id: 'liubiao', name: '刘表', color: '#4f8f8c', short: '表' },
      liuzhang: { id: 'liuzhang', name: '刘璋', color: '#9a6d54', short: '璋' },
      zhanglu: { id: 'zhanglu', name: '张鲁', color: '#7b677c', short: '鲁' },
      mateng: { id: 'mateng', name: '马腾 / 韩遂', color: '#8b744f', short: '马' },
      sun: { id: 'sun', name: '孙权', color: '#bd7d36', short: '孙' },
      yuanshu: { id: 'yuanshu', name: '袁术余部', color: '#7d5a35', short: '术' },
      local: { id: 'local', name: '地方势力', color: '#958d78', short: '地' }
    };

    const DEFAULT_FACTION_RELATIONS = {
      cao: { yuan: -40, gongsun: -25, liu: -15, liubiao: -20, liuzhang: -5, zhanglu: -10, mateng: -15, sun: -15, yuanshu: -30, local: -5 },
      yuan: { cao: -40, gongsun: -30, liu: -10, liubiao: -5, sun: -10, yuanshu: -25, local: -5 },
      gongsun: { yuan: -30, cao: -25, liu: -5, liubiao: -5, sun: -5, local: -5 },
      liu: { cao: -15, yuan: -10, liubiao: -5, sun: -5, yuanshu: -10, local: -5 },
      liubiao: { cao: -10, yuan: -5, sun: -30, liu: -5, yuanshu: -15, local: -5 },
      liuzhang: { cao: -5, zhanglu: -20, liubiao: -5, mateng: -5, local: -5 },
      zhanglu: { liuzhang: -20, cao: -10, mateng: -10, local: -5 },
      mateng: { cao: -15, zhanglu: -10, liuzhang: -5, local: -5 },
      sun: { liubiao: -30, cao: -15, yuan: -10, liu: -5, yuanshu: -20, local: -5 },
      yuanshu: { cao: -30, yuan: -25, sun: -20, liubiao: -15, liu: -10, local: -5 },
      local: { cao: -5, yuan: -5, gongsun: -5, liu: -5, liubiao: -5, liuzhang: -5, zhanglu: -5, mateng: -5, sun: -5, yuanshu: -5 }
    };

    const MAX_VISIBLE_NPC_CAMPAIGN_ROUTES = 8;
    const NPC_WAR_COOLDOWN_TURNS = 3;
    const MAX_NPC_CAMPAIGNS_PER_TURN = 3;
    const MAX_ATTACKERS_PER_TARGET_CITY = 3;
    const MULTI_FACTION_TARGET_CHANCE = 0.22;
    const NPC_RECRUITMENT_REPORT_THRESHOLD = 650;
    const CHARACTER_PORTRAITS = {
      liuBiao: './assets/characters/liu-biao.png',
      caiMao: './assets/characters/cai-mao.jpg',
      kuaiYue: './assets/characters/kuai-yue.jpg',
      huangZu: './assets/characters/huang-zu.jpg',
      wenPin: './assets/characters/wen-pin.jpg',
      caoCao: './assets/characters/cao-cao.jpg',
      sunQuan: './assets/characters/sun-quan.jpg',
      liuBei: './assets/characters/liu-bei.jpg',
      guanYu: './assets/characters/guan-yu.jpg',
      zhangFei: './assets/characters/zhang-fei.jpg',
      zhugeLiang: './assets/characters/zhuge-liang.jpg',
      pangTong: './assets/characters/pang-tong.jpg',
      xuShu: './assets/characters/xu-shu.jpg',
      jianYong: './assets/characters/jian-yong.jpg',
      miZhu: './assets/characters/mi-zhu.jpg',
      sunQian: './assets/characters/sun-qian.jpg',
      zhangLiao: './assets/characters/zhang-liao.jpg',
      yueJin: './assets/characters/yue-jin.jpg',
      yuJin: './assets/characters/yu-jin.jpg',
      xuHuang: './assets/characters/xu-huang.jpg',
      xiahouDun: './assets/characters/xiahou-dun.jpg',
      xiahouYuan: './assets/characters/xiahou-yuan.jpg',
      caoRen: './assets/characters/cao-ren.jpg',
      caoHong: './assets/characters/cao-hong.jpg',
      dianWei: './assets/characters/dian-wei.jpg',
      xuChu: './assets/characters/xu-chu.jpg',
      liDian: './assets/characters/li-dian.jpg',
      zangBa: './assets/characters/zang-ba.jpg',
      xunYu: './assets/characters/xun-yu.jpg',
      xunYou: './assets/characters/xun-you.jpg',
      guoJia: './assets/characters/guo-jia.jpg',
      chengYu: './assets/characters/cheng-yu.jpg',
      jiaXu: './assets/characters/jia-xu.jpg',
      liuYe: './assets/characters/liu-ye.jpg',
      manChong: './assets/characters/man-chong.jpg',
      simaYi: './assets/characters/sima-yi.jpg',
      chenQun: './assets/characters/chen-qun.jpg',
      sunCe: './assets/characters/sun-ce.jpg',
      sunJian: './assets/characters/sun-jian.jpg',
      zhouYu: './assets/characters/zhou-yu.jpg',
      luSu: './assets/characters/lu-su.jpg',
      luMeng: './assets/characters/lu-meng.jpg',
      luXun: './assets/characters/lu-xun.jpg',
      taishiCi: './assets/characters/taishi-ci.jpg',
      ganNing: './assets/characters/gan-ning.jpg',
      huangGai: './assets/characters/huang-gai.jpg',
      chengPu: './assets/characters/cheng-pu.jpg',
      hanDang: './assets/characters/han-dang.jpg',
      zhouTai: './assets/characters/zhou-tai.jpg',
      lingTong: './assets/characters/ling-tong.jpg',
      zhangZhao: './assets/characters/zhang-zhao.jpg',
      zhangHong: './assets/characters/zhang-hong.jpg',
      buZhi: './assets/characters/bu-zhi.jpg',
      zhuGeJin: './assets/characters/zhu-ge-jin.jpg',
      kuaiLiang: './assets/characters/kuai-liang.jpg',
      yiJi: './assets/characters/yi-ji.jpg',
      maLiang: './assets/characters/ma-liang.jpg',
      maSu: './assets/characters/ma-su.jpg',
      huangZhong: './assets/characters/huang-zhong.jpg',
      weiYan: './assets/characters/wei-yan.jpg',
      liuQi: './assets/characters/liu-qi.jpg',
      liuCong: './assets/characters/liu-cong.jpg',
      liuZhang: './assets/characters/liu-zhang.jpg',
      zhangRen: './assets/characters/zhang-ren.jpg',
      yanYan: './assets/characters/yan-yan.jpg',
      faZheng: './assets/characters/fa-zheng.jpg',
      liYan: './assets/characters/li-yan.jpg',
      huangQuan: './assets/characters/huang-quan.jpg',
      wuYi: './assets/characters/wu-yi.jpg',
      mengDa: './assets/characters/meng-da.jpg',
      zhangLu: './assets/characters/zhang-lu.jpg',
      yangSong: './assets/characters/yang-song.jpg',
      yanPu: './assets/characters/yan-pu.jpg',
      zhangWei: './assets/characters/zhang-wei.jpg',
      yangBai: './assets/characters/yang-bai.jpg',
      maTeng: './assets/characters/ma-teng.jpg',
      hanSui: './assets/characters/han-sui.jpg',
      maChao: './assets/characters/ma-chao.jpg',
      maDai: './assets/characters/ma-dai.jpg',
      pangDe: './assets/characters/pang-de.jpg',
      maYunlu: './assets/characters/ma-yunlu.jpg',
      gongsunZan: './assets/characters/gongsun-zan.jpg',
      zhaoYun: './assets/characters/zhao-yun.jpg',
      tianKai: './assets/characters/tian-kai.jpg',
      yanGang: './assets/characters/yan-gang.jpg',
      yuanShu: './assets/characters/yuan-shu.jpg',
      jiLing: './assets/characters/ji-ling.jpg',
      yanXiang: './assets/characters/yan-xiang.jpg',
      qiaoRui: './assets/characters/qiao-rui.jpg',
      zhangXun: './assets/characters/zhang-xun.jpg',
      leiBo: './assets/characters/lei-bo.jpg',
      chenLan: './assets/characters/chen-lan.jpg',
      huaTuo: './assets/characters/hua-tuo.jpg',
      zuoCi: './assets/characters/zuo-ci.jpg',
      siMaHui: './assets/characters/si-ma-hui.jpg',
      huangChengYan: './assets/characters/huang-cheng-yan.jpg',
      pangDeGong: './assets/characters/pang-de-gong.jpg',
      xuShao: './assets/characters/xu-shao.jpg',
      qiaoXuan: './assets/characters/qiao-xuan.jpg',
      yuanShao: './assets/characters/yuan-shao.png',
      juShou: './assets/characters/ju-shou.png',
      tianFeng: './assets/characters/tian-feng.png',
      xuYou: './assets/characters/xu-you.png',
      shenPei: './assets/characters/shen-pei.png',
      guoTu: './assets/characters/guo-tu.png',
      fengJi: './assets/characters/feng-ji.png',
      yanLiang: './assets/characters/yan-liang.png',
      wenChou: './assets/characters/wen-chou.png',
      zhangHe: './assets/characters/zhang-he.png',
      gaoLan: './assets/characters/gao-lan.png'
    };

    const PLAYER_IDENTITIES = {
      commandant: {
        id: 'commandant',
        name: '桂阳都尉',
        title: '桂阳都尉',
        actionPointBonuses: { gov: 0, mil: 1, scheme: 0, dip: 0, inner: 0 },
        apply(city, state) {
          city.garrison.infantry += 220;
          city.garrison.archers += 60;
          state.characters.jingnanGentry.suspicion = clamp(state.characters.jingnanGentry.suspicion + 8, 0, 100);
        }
      },
      granary: {
        id: 'granary',
        name: '桂阳督粮官',
        title: '桂阳督粮官',
        actionPointBonuses: { gov: 0, mil: 0, scheme: 0, dip: 0, inner: 0 },
        apply(city, state) {
          city.food += 1200;
          city.money += 280;
          city.agriculture = clamp(city.agriculture + 5, 0, 100);
          city.garrison.infantry = Math.max(0, city.garrison.infantry - 100);
          state.player.grainEfficiency = 1.15;
        }
      },
      magistrate: {
        id: 'magistrate',
        name: '桂阳县令',
        title: '桂阳县令',
        actionPointBonuses: { gov: 1, mil: 0, scheme: 0, dip: 0, inner: 0 },
        apply(city) {
          city.publicSupport = clamp(city.publicSupport + 12, 0, 100);
          city.order = clamp(city.order + 12, 0, 100);
          city.garrison.infantry = Math.max(0, city.garrison.infantry - 80);
        }
      }
    };

    function characterBlueprint(id, name, data = {}) {
      return {
        id,
        name,
        faction: data.faction || 'local',
        location: data.location || 'guiyang',
        role: data.role || '地方人物',
        title: data.title || '',
        type: data.type || '政务',
        status: data.status || 'hidden',
        rarity: data.rarity || '普通',
        historical: data.historical !== false,
        randomTalent: Boolean(data.randomTalent),
        portraitPlaceholder: data.portraitPlaceholder || name.slice(-2),
        portraitUrl: data.portraitUrl || CHARACTER_PORTRAITS[id] || '',
        summary: data.summary || '尚待进一步接触。',
        stats: Object.assign({ command: 42, strategy: 42, politics: 42, charm: 42, loyalty: 52, ambition: 36 }, data.stats || {}),
        personality: Object.assign({ brave: 42, cautious: 48, greedy: 28, loyal: 52, proud: 40, ruthless: 28, idealistic: 44 }, data.personality || {}),
        attitudeToPlayer: Number(data.attitudeToPlayer ?? 42),
        trustPlayer: Number(data.trustPlayer ?? 38),
        fearPlayer: Number(data.fearPlayer ?? 8),
        respectPlayer: Number(data.respectPlayer ?? 32),
        suspicionOfPlayer: Number(data.suspicionOfPlayer ?? 28),
        relationshipTags: Array.isArray(data.relationshipTags) ? data.relationshipTags : [],
        memory: Array.isArray(data.memory) ? data.memory : [],
        values: Array.isArray(data.values) ? data.values : [],
        boundaries: Array.isArray(data.boundaries) ? data.boundaries : [],
        longTermGoal: data.longTermGoal || '',
        privateAgenda: data.privateAgenda || '',
        speechStyle: Object.assign({ register: '平实', rhythm: '平衡', habit: '', metaphor: '' }, data.speechStyle || {}),
        initiative: Object.assign({ lastTurn: -99, cooldown: 4, urgency: 0 }, data.initiative || {}),
        currentPlan: data.currentPlan || '观望局势',
        specialSchemes: Array.isArray(data.specialSchemes) ? data.specialSchemes : [],
        passiveBonuses: Array.isArray(data.passiveBonuses) ? data.passiveBonuses : [],
        battleTags: Array.isArray(data.battleTags) ? data.battleTags : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        recruitmentDifficulty: Number(data.recruitmentDifficulty ?? 52),
        discoveredBy: data.discoveredBy || '',
        recruitedBy: data.recruitedBy || '',
        originFaction: data.originFaction || data.faction || 'local',
        possibleFactions: Array.isArray(data.possibleFactions) ? data.possibleFactions : [data.faction || 'local'],
        defectionTriggers: Array.isArray(data.defectionTriggers) ? data.defectionTriggers : [],
        offMapLocation: data.offMapLocation || '',
        isFactionLord: data.isFactionLord === true,
        lordOfFaction: data.lordOfFaction || '',
        lordTitle: data.lordTitle || '',
        solicitationState: data.solicitationState || '',
        lordSolicitation: data.lordSolicitation || null
      };
    }

    const INTERNAL_PLAYER_CHARACTER_IDS = new Set([
      'player',
      'guardCaptain',
      'scoutChief',
      'chiefClerk',
      'quartermaster'
    ]);

    function isInternalPlayerCharacterId(id) {
      return INTERNAL_PLAYER_CHARACTER_IDS.has(String(id || ''));
    }

    function isExternalCharacter(character) {
      return character && !isInternalPlayerCharacterId(character.id);
    }

    const FACTION_LORD_META = {
      liuBiao: { faction: 'liubiao', title: '荆州牧' },
      caoCao: { faction: 'cao', title: '兖州牧' },
      yuanShao: { faction: 'yuan', title: '河北之主' },
      sunQuan: { faction: 'sun', title: '江东之主' },
      liuBei: { faction: 'liu', title: '汉室宗亲' },
      yuanShu: { faction: 'yuanshu', title: '仲家帝' },
      liuZhang: { faction: 'liuzhang', title: '益州牧' },
      zhangLu: { faction: 'zhanglu', title: '汉中太守' },
      maTeng: { faction: 'mateng', title: '西凉军阀' },
      gongsunZan: { faction: 'gongsun', title: '白马将军' }
    };

    const FACTION_LORD_IDS = new Set(Object.keys(FACTION_LORD_META));

    function isFactionLordCharacter(characterOrId) {
      const id = typeof characterOrId === 'string'
        ? characterOrId
        : characterOrId?.id;
      const character = typeof characterOrId === 'string'
        ? gameState?.characterRoster?.[id]
        : characterOrId;
      if (!id && !character) return false;
      const roleText = String(character?.role || '');
      const titleText = String(character?.title || character?.lordTitle || '');
      return (
        FACTION_LORD_IDS.has(id) ||
        character?.isFactionLord === true ||
        roleText === '主公' ||
        titleText === '主公' ||
        titleText === '州牧' ||
        titleText === '诸侯' ||
        /诸侯|之主|军阀|州牧|太守|仲家帝/.test(roleText + titleText)
      );
    }

    function getFactionMilitaryPower(factionId) {
      return Object.values(gameState.cities || {})
        .filter(city => city && cityController(city.id) === factionId)
        .reduce((sum, city) => sum + realTroops(city.garrison), 0);
    }

    function getFactionAveragePublicSupport(factionId) {
      const cities = Object.values(gameState.cities || {})
        .filter(city => city && cityController(city.id) === factionId);
      if (!cities.length) return 0;
      return cities.reduce((sum, city) => sum + Number(city.publicSupport || 0), 0) / cities.length;
    }

    function getPlayerMilitaryPower() {
      return controlledCities().reduce((sum, city) => sum + realTroops(city.garrison), 0);
    }

    function getPlayerAveragePublicSupport() {
      const cities = controlledCities();
      if (!cities.length) return 0;
      return cities.reduce((sum, city) => sum + Number(city.publicSupport || 0), 0) / cities.length;
    }

    function getPlayerAverageOrder() {
      const cities = controlledCities();
      if (!cities.length) return 0;
      return cities.reduce((sum, city) => sum + Number(city.order || 0), 0) / cities.length;
    }

    function getFactionControlledCityIds(factionId) {
      return Object.values(gameState.cities || {})
        .filter(city => city && !isRemovedCityId(city.id) && cityController(city.id) === factionId)
        .map(city => city.id);
    }

    function getFactionPressureProfile(factionId) {
      const controlled = getFactionControlledCityIds(factionId);
      const activeAgainst = (gameState.campaigns || []).filter(campaign =>
        isActiveCampaign(campaign) &&
        cityController(campaign.target) === factionId &&
        campaign.faction !== factionId
      );
      const recentWars = (gameState.factionWarState?.recentWars || [])
        .filter(war => war && gameState.turn - Number(war.turn || 0) <= 12);
      const recentAgainst = recentWars.filter(war => war.defender === factionId || cityController(war.target) === factionId);
      const playerAttacks = recentAgainst.filter(war => war.attacker === 'player').length +
        activeAgainst.filter(campaign => campaign.faction === 'player').length;
      const lostCities = recentWars.filter(war =>
        war.defender === factionId &&
        war.target &&
        gameState.cities?.[war.target] &&
        cityController(war.target) !== factionId
      ).length;
      const siegeCount = activeAgainst.filter(campaign => campaign.status === 'siege').length;
      const targetTroops = getFactionMilitaryPower(factionId);
      const playerTroops = getPlayerMilitaryPower();
      const troopDisadvantage = targetTroops <= 0 ? 1.4 : clamp(playerTroops / Math.max(1, targetTroops) - 1, 0, 2.5);
      const cityPressure = controlled.length <= 1 ? 1 : clamp((activeAgainst.length + recentAgainst.length + lostCities) / Math.max(1, controlled.length), 0, 2.2);
      const pressure = clamp(
        activeAgainst.length * 10 +
        siegeCount * 12 +
        recentAgainst.length * 5 +
        lostCities * 14 +
        troopDisadvantage * 18 +
        (controlled.length <= 1 ? 8 : 0),
        0,
        100
      );
      const grievance = clamp(
        playerAttacks * 16 +
        lostCities * 8 +
        siegeCount * 5 +
        cityPressure * 8,
        0,
        100
      );
      return {
        pressure,
        grievance,
        activeAttacks: activeAgainst.length,
        siegeCount,
        recentAttacks: recentAgainst.length,
        playerAttacks,
        lostCities,
        cityCount: controlled.length,
        troopDisadvantage
      };
    }

    const LORD_SOLICITATION_PROFILES = {
      liuBei: { focus: '仁义与民心', minPublic: 68, minPrestige: 45, minTrust: 62, minRespect: 55, weightPublic: 1.45, weightPrestige: 1.2, weightTroops: 0.45, weightOrder: 0.55, baseDifficulty: 72, minChance: 8, maxChance: 38 },
      caoCao: { focus: '实力、秩序与威慑', minTroopRatio: 1.65, minOrder: 55, minPrestige: 52, minRespect: 65, weightTroops: 1.35, weightOrder: 1.05, weightPrestige: 0.9, weightFear: 0.9, baseDifficulty: 82, minChance: 6, maxChance: 30 },
      sunQuan: { focus: '江东稳定、经济与水路安全', minCityCount: 5, minOrder: 55, minPrestige: 48, minTrust: 56, weightCities: 0.9, weightOrder: 0.95, weightPrestige: 0.9, weightPublic: 0.6, baseDifficulty: 74, minChance: 8, maxChance: 34 },
      yuanShao: { focus: '声望、名分与体面', minPrestige: 65, minCityCount: 5, minRespect: 58, weightPrestige: 1.45, weightCities: 0.9, weightRespect: 0.9, baseDifficulty: 76, minChance: 8, maxChance: 36 },
      liuBiao: { focus: '合法性、荆州稳定与士族信任', minPrestige: 55, minPublic: 62, minOrder: 58, minRespect: 55, weightPrestige: 1.0, weightPublic: 1.05, weightOrder: 0.95, baseDifficulty: 78, minChance: 7, maxChance: 32 },
      liuZhang: { focus: '保境安民与安全承诺', minPublic: 60, minOrder: 55, minTrust: 55, weightPublic: 1.0, weightOrder: 0.9, weightTrust: 0.95, weightPressure: 0.9, baseDifficulty: 62, minChance: 12, maxChance: 52 },
      zhangLu: { focus: '地方秩序与自治承诺', minOrder: 62, minPublic: 55, minTrust: 52, weightOrder: 1.2, weightPublic: 0.8, weightTrust: 0.8, baseDifficulty: 60, minChance: 12, maxChance: 50 },
      maTeng: { focus: '军力、边地安全与抗曹形势', minTroopRatio: 1.35, minRespect: 52, weightTroops: 1.15, weightRespect: 0.85, weightFear: 0.55, weightPressure: 1.0, baseDifficulty: 66, minChance: 10, maxChance: 48 },
      gongsunZan: { focus: '军力、北方战局与压制袁绍', minTroopRatio: 1.45, minRespect: 55, weightTroops: 1.2, weightRespect: 0.75, weightPressure: 0.95, baseDifficulty: 68, minChance: 10, maxChance: 45 },
      yuanShu: { focus: '强权、体面与利益', minTroopRatio: 1.5, minPrestige: 45, weightTroops: 1.1, weightPrestige: 0.6, weightFear: 0.85, weightPressure: 1.1, baseDifficulty: 64, minChance: 10, maxChance: 46 },
      default: { focus: '实力、声望、关系与败势压力', minTroopRatio: 1.35, minPrestige: 45, minTrust: 55, minRespect: 50, weightTroops: 0.95, weightPrestige: 0.8, weightTrust: 0.85, weightRespect: 0.75, weightPressure: 0.8, baseDifficulty: 66, minChance: 10, maxChance: 45 }
    };

    function getLordSolicitationProfile(character) {
      return LORD_SOLICITATION_PROFILES[character?.id] || LORD_SOLICITATION_PROFILES.default;
    }

    function getLordSolicitationEligibility(character) {
      if (!isFactionLordCharacter(character)) {
        return { isLord: false, eligible: false, locked: false, reason: '不是势力主公' };
      }
      const factionId = character.lordOfFaction || FACTION_LORD_META[character.id]?.faction || character.faction;
      const profile = getLordSolicitationProfile(character);
      const playerTroops = getPlayerMilitaryPower();
      const targetTroops = getFactionMilitaryPower(factionId);
      const playerPublic = getPlayerAveragePublicSupport();
      const targetPublic = getFactionAveragePublicSupport(factionId);
      const playerOrder = getPlayerAverageOrder();
      const playerCityCount = controlledCities().length;
      const targetCityCount = getFactionControlledCityIds(factionId).length;
      const pressure = getFactionPressureProfile(factionId);
      const troopRatio = playerTroops / Math.max(1, targetTroops);
      const prestige = Number(gameState.player?.prestige || 0);
      const trust = Number(character.trustPlayer || 0);
      const respect = Number(character.respectPlayer || 0);
      const fear = Number(character.fearPlayer || 0);
      const suspicion = Number(character.suspicionOfPlayer || 0);
      const troopRatioRequired = profile.minTroopRatio || (targetCityCount <= 1 ? 1.25 : 1.55);
      const checks = [
        { key: 'troops', ok: troopRatio >= troopRatioRequired || pressure.pressure >= 62, label: '兵力或败势压力', detail: '兵力比 ' + fmtPercent(troopRatio) + ' / ' + fmtPercent(troopRatioRequired) + '，压力 ' + Math.round(pressure.pressure) },
        { key: 'prestige', ok: prestige >= (profile.minPrestige || 40), label: '声望', detail: Math.round(prestige) + ' / ' + (profile.minPrestige || 40) },
        { key: 'trust', ok: trust >= (profile.minTrust || 48) || pressure.pressure >= 70, label: '信任', detail: Math.round(trust) + ' / ' + (profile.minTrust || 48) },
        { key: 'respect', ok: respect >= (profile.minRespect || 45), label: '尊重', detail: Math.round(respect) + ' / ' + (profile.minRespect || 45) },
        { key: 'public', ok: playerPublic >= (profile.minPublic || 45), label: '我方民心', detail: Math.round(playerPublic) + ' / ' + (profile.minPublic || 45) },
        { key: 'order', ok: playerOrder >= (profile.minOrder || 40), label: '我方治安', detail: Math.round(playerOrder) + ' / ' + (profile.minOrder || 40) },
        { key: 'cities', ok: playerCityCount >= (profile.minCityCount || 2), label: '控制城池', detail: playerCityCount + ' / ' + (profile.minCityCount || 2) }
      ];
      const failed = checks.filter(check => !check.ok);

      const score = clamp(
        (troopRatio - 1) * 18 * (profile.weightTroops || 0.75) +
        (prestige - 35) * 0.55 * (profile.weightPrestige || 0.65) +
        (playerPublic - 45) * 0.65 * (profile.weightPublic || 0.55) +
        (playerOrder - 45) * 0.55 * (profile.weightOrder || 0.45) +
        (trust - 45) * 0.85 * (profile.weightTrust || 0.6) +
        (respect - 45) * 0.75 * (profile.weightRespect || 0.55) +
        (fear - 30) * 0.35 * (profile.weightFear || 0.35) +
        pressure.pressure * 0.55 * (profile.weightPressure || 0.65) -
        suspicion * 0.45 -
        Number(character.personality?.proud || 45) * 0.16 -
        Number(character.stats?.ambition || 45) * 0.14,
        -60,
        120
      );
      const unlockScore = score >= profile.baseDifficulty - 30;
      const eligible = failed.length <= 2 && unlockScore && character.status !== 'recruited';
      const successChance = clamp(
        (score - profile.baseDifficulty + 50) / 100,
        (profile.minChance || 8) / 100,
        (profile.maxChance || 45) / 100
      );

      if (character.id === 'liuBiao' && !gameState.player?.independent) {
        return {
          isLord: true,
          eligible: false,
          locked: true,
          reason: '你仍在刘表名义庇护之下，不可招揽主君。',
          playerTroops,
          targetTroops,
          playerPublic,
          targetPublic,
          playerOrder,
          playerCityCount,
          targetCityCount,
          details: { checks, failed, pressure, profile, troopRatio, score, successChance }
        };
      }

      return {
        isLord: true,
        eligible,
        locked: !eligible,
        reason: eligible
          ? '条件已足，可尝试招揽；但主公仍可能争执、拒绝或反目。'
          : '主公招揽条件不足：' + (failed.map(item => item.label).join('、') || '局势压力或关系不足') + '。',
        details: {
          checks,
          failed,
          pressure,
          profile,
          troopRatio,
          score,
          successChance,
          requiredTroopRatio: troopRatioRequired
        },
        playerTroops,
        targetTroops,
        playerPublic,
        targetPublic,
        playerOrder,
        playerCityCount,
        targetCityCount,
        successChance,
        pressure,
        profile
      };
    }

    function normalizeAppointments(state) {
      state.appointments ||= {};
      state.appointments.cityOfficials ||= {};
      state.appointments.campaignCommanders ||= {};
      state.appointments.autoTasks ||= {};
      state.appointments.autoGovSpentThisTurn ||= 0;
      state.appointments.autoMilSpentThisTurn ||= 0;

      Object.values(state.appointments.cityOfficials || {}).forEach(slots => {
        if (!slots || typeof slots !== 'object') return;
        if (!Array.isArray(slots.administratorIds)) {
          slots.administratorIds = slots.administratorId ? [slots.administratorId] : [];
        }
        if (!Array.isArray(slots.militaryOfficerIds)) {
          slots.militaryOfficerIds = slots.militaryOfficerId ? [slots.militaryOfficerId] : [];
        }
        slots.administratorIds = [...new Set(slots.administratorIds.filter(Boolean))];
        slots.militaryOfficerIds = [...new Set(slots.militaryOfficerIds.filter(Boolean))];
        slots.administratorId = slots.administratorIds[0] || slots.administratorId || null;
        slots.militaryOfficerId = slots.militaryOfficerIds[0] || slots.militaryOfficerId || null;
        slots.policyOfficerId ||= null;
      });

      Object.values(state.appointments.autoTasks || {}).forEach(task => {
        if (!task || typeof task !== 'object') return;
        task.enabled = task.enabled === true;
        task.militaryMode ||= 'none';
        task.civilMode ||= 'none';
        task.policyMode ||= 'none';
        task.militaryPrepMode ||= 'none';
        if (!Array.isArray(task.civilModes)) {
          task.civilModes = task.civilMode && task.civilMode !== 'none' ? [task.civilMode] : [];
        }
        if (!Array.isArray(task.militaryPrepModes)) {
          task.militaryPrepModes = task.militaryPrepMode && task.militaryPrepMode !== 'none' ? [task.militaryPrepMode] : [];
        }
        task.civilModes = [...new Set(task.civilModes.filter(mode => mode && mode !== 'none'))];
        task.militaryPrepModes = [...new Set(task.militaryPrepModes.filter(mode => mode && mode !== 'none'))];
      });
      return state.appointments;
    }

    function getCityAdministratorLimit(city) {
      if (!city) return 1;
      let limit = 2;
      if (Number(city.level || 1) >= 3) limit += 1;
      if (Number(city.population || 0) >= 90000) limit += 1;
      return clamp(limit, 2, 4);
    }

    function getCityMilitaryOfficerLimit(city) {
      if (!city) return 1;
      let limit = 1;
      if (Number(city.level || 1) >= 3) limit += 1;
      if (realTroops(city.garrison) >= 5000) limit += 1;
      return clamp(limit, 1, 3);
    }

    function getCityOfficials(cityId, role) {
      normalizeAppointments(gameState);
      const slots = gameState.appointments?.cityOfficials?.[cityId] || {};

      if (role === 'administratorId') {
        const ids = Array.isArray(slots.administratorIds)
          ? slots.administratorIds
          : (slots.administratorId ? [slots.administratorId] : []);
        return ids
          .map(id => gameState.characterRoster?.[id])
          .filter(c => c && c.status === 'recruited' && canManageCity(c));
      }

      if (role === 'militaryOfficerId') {
        const ids = Array.isArray(slots.militaryOfficerIds)
          ? slots.militaryOfficerIds
          : (slots.militaryOfficerId ? [slots.militaryOfficerId] : []);
        return ids
          .map(id => gameState.characterRoster?.[id])
          .filter(c => c && c.status === 'recruited' && canLeadArmy(c));
      }

      if (role === 'policyOfficerId') {
        const c = gameState.characterRoster?.[slots.policyOfficerId];
        return c && c.status === 'recruited' && canManageCity(c) ? [c] : [];
      }

      return [];
    }

    function getCityOfficialEffect(cityId, role) {
      const character = getCityOfficials(cityId, role)[0] || null;

      if (!character || character.status !== 'recruited') {
        return { character: null, multiplier: 1 };
      }

      const s = character.stats || {};
      let multiplier = 1;

      if (role === 'militaryOfficerId') {
        multiplier = clamp(1 + (Number(s.command || 50) - 50) * 0.005, 0.9, 1.25);
      } else if (role === 'administratorId') {
        multiplier = clamp(1 + (Number(s.politics || 50) - 50) * 0.005, 0.9, 1.25);
      } else if (role === 'policyOfficerId') {
        multiplier = clamp(
          1 + (Number(s.politics || 50) - 50) * 0.004 + (Number(s.charm || 50) - 50) * 0.003,
          0.9,
          1.25
        );
      }

      return { character, multiplier };
    }

    function setCityAutoTask(cityId, field, value) {
      const city = gameState.cities?.[cityId];
      if (!city || !isControlledBy(city.id, 'player')) return;
      const allowed = ['enabled', 'militaryMode', 'civilMode', 'civilModes', 'policyMode', 'militaryPrepMode', 'militaryPrepModes'];
      if (!allowed.includes(field)) return;

      normalizeAppointments(gameState);
      gameState.appointments.autoTasks[cityId] ||= {
        enabled: false,
        militaryMode: 'none',
        civilMode: 'none',
        civilModes: [],
        policyMode: 'none',
        militaryPrepMode: 'none',
        militaryPrepModes: []
      };
      if (field === 'civilModes' || field === 'militaryPrepModes') {
        const values = Array.isArray(value) ? value : String(value || '').split(',');
        gameState.appointments.autoTasks[cityId][field] = [...new Set(values.map(v => String(v).trim()).filter(v => v && v !== 'none'))];
      } else {
        gameState.appointments.autoTasks[cityId][field] = value;
      }
      saveToStorage(false);
      render();
    }

    function toggleCityAutoTaskMode(cityId, field, mode) {
      if (!['civilModes', 'militaryPrepModes'].includes(field)) return;
      const city = gameState.cities?.[cityId];
      if (!city || !isControlledBy(city.id, 'player')) return;
      normalizeAppointments(gameState);
      const task = gameState.appointments.autoTasks[cityId] ||= {};
      const list = Array.isArray(task[field]) ? task[field] : [];

      if (list.includes(mode)) {
        task[field] = list.filter(x => x !== mode);
      } else if (mode && mode !== 'none') {
        task[field] = [...list, mode];
      }

      saveToStorage(false);
      render();
    }

    function getUniqueAutoTaskModes(task, field, legacyField, allowedModes) {
      const list = Array.isArray(task?.[field]) && task[field].length
        ? task[field]
        : (task?.[legacyField] && task[legacyField] !== 'none' ? [task[legacyField]] : []);
      return [...new Set(list)]
        .filter(mode => mode && mode !== 'none')
        .filter(mode => !allowedModes || allowedModes.includes(mode));
    }

    function canBeAppointed(character) {
      return character
        && isExternalCharacter(character)
        && character.status === 'recruited'
        && !isFactionLordCharacter(character)
        && !['dead', 'captured'].includes(character.status);
    }

    function canLeadArmy(character) {
      return canBeAppointed(character)
        && ['武将', '谋士'].includes(character.type);
    }

    function canManageCity(character) {
      return canBeAppointed(character)
        && ['政务', '谋士', '名士'].includes(character.type);
    }

    function getAppointedCharacter(id) {
      return gameState.characterRoster?.[id] || null;
    }

    function getCampaignCommander(campaign) {
      if (!campaign || campaign.faction !== 'player' || campaign.type !== 'attack') return null;

      const commanderId = gameState.appointments?.campaignCommanders?.[campaign.id];
      const commander = gameState.characterRoster?.[commanderId];

      if (!commander) return null;
      if (!canLeadArmy(commander)) return null;

      return commander;
    }

    function getCharacterBattleTags(character) {
      if (!character) return [];
      if (Array.isArray(character.battleTags) && character.battleTags.length) return uniqueTextList(character.battleTags);
      return inferCharacterBattleTags(character);
    }

    function inferCharacterBattleTags(character) {
      const text = [
        character.name,
        character.role,
        character.title,
        character.type,
        character.summary,
        ...(Array.isArray(character.values) ? character.values : []),
        ...(Array.isArray(character.specialSchemes) ? character.specialSchemes : []),
        ...(Array.isArray(character.passiveBonuses) ? character.passiveBonuses : [])
      ].filter(Boolean).join('、');
      const tags = [];
      const command = Number(character.stats?.command || 0);
      const strategy = Number(character.stats?.strategy || 0);
      const martial = character.type === '武将' || command >= 58;
      if (/骑|马|西凉|白马|铁骑|羌骑|边骑|长驱|奔袭/.test(text)) tags.push('善骑兵');
      if (/水|江|船|赤壁|水军|锦帆|渡|津|海|河/.test(text)) tags.push('善水战');
      if (/袭|奇|伏|夜|截|劫营|突|声东击西|出奇|斥候/.test(text) || strategy >= 82) tags.push('善突袭');
      if (martial && (/陆|步|阵|攻城|守城|军法|万人敌|将军|先登|坚守|统军/.test(text) || !tags.length)) tags.push('善陆战');
      return uniqueTextList(tags);
    }

    function specialSchemeRequirement(character) {
      const difficulty = Number(character?.recruitmentDifficulty || 55);
      return {
        trust: clamp(Math.round(difficulty - 8), 48, 72),
        respect: clamp(Math.round(42 + Number(character?.stats?.strategy || 50) / 10), 45, 58)
      };
    }

    function specialSchemeUnlockState(character) {
      const req = specialSchemeRequirement(character);
      if (!character) return { unlocked: false, req, reason: '人物不存在' };
      if (character.status !== 'recruited') return { unlocked: false, req, reason: '需先招募此人' };
      if (Number(character.trustPlayer || 0) < req.trust) return { unlocked: false, req, reason: '信任需达到 ' + req.trust };
      if (Number(character.respectPlayer || 0) < req.respect) return { unlocked: false, req, reason: '尊重需达到 ' + req.respect };
      return { unlocked: true, req, reason: '已解锁' };
    }

    function stableSchemeHash(text) {
      let hash = 2166136261;
      for (const ch of String(text || '')) {
        hash ^= ch.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

    function getCharacterSpecialSchemes(character) {
      const schemes = uniqueTextList(character?.specialSchemes || []);
      if (schemes.length) return schemes;
      if (!character || !isExternalCharacter(character)) return [];
      const suffix = character.type === '武将' ? '军略' : character.type === '医者' ? '医策' : character.type === '名士' ? '清议' : character.type === '政务' ? '政略' : '奇策';
      return [character.name + suffix];
    }

    function inferSpecialSchemeArchetype(character, scheme) {
      const text = [character?.name, character?.role, character?.type, character?.summary, scheme, ...(character?.values || [])].filter(Boolean).join('、');
      const stats = character?.stats || {};
      if (/医|药|麻沸|五禽|救/.test(text)) return 'heal';
      if (/商|财|粮|兵粮|助军|求援|倾财/.test(text)) return 'logistics';
      if (/荐|识|评|月旦|水镜|举贤|人才|诸葛|卧龙|凤雏/.test(text)) return 'talent';
      if (/外交|说服|奔走|结盟|密谈|号令|谏|忠谏/.test(text)) return 'diplomacy';
      if (/士族|豪强|治|安民|郡吏|屯田|法度|政/.test(text) || character?.type === '政务') return 'govern';
      if (/守|坚|防|固|护主|不退|孤城/.test(text)) return 'defense';
      if (/骑|奔袭|冲锋|长驱|白马|突阵|奇袭|夜袭|破阵|先登|万人敌|怒吼|威震/.test(text) || Number(stats.command || 0) >= 82) return 'assault';
      if (/谋|计|火|伏|断|扰|间|乱|奇|遁甲|空城/.test(text) || Number(stats.strategy || 0) >= 78) return 'scheme';
      if (character?.type === '武将') return 'command';
      return 'influence';
    }

    function specialSchemeProfile(character, scheme) {
      const hash = stableSchemeHash((character?.id || character?.name || '') + ':' + scheme);
      const archetype = inferSpecialSchemeArchetype(character, scheme);
      const variants = {
        assault: ['破阵', '夺气', '突进', '震慑'],
        command: ['整军', '压阵', '号令', '持重'],
        defense: ['固守', '护援', '拒敌', '收拢'],
        scheme: ['扰乱', '识破', '断谋', '设伏'],
        logistics: ['筹粮', '输财', '补给', '商路'],
        diplomacy: ['说项', '缓敌', '结好', '正名'],
        govern: ['安民', '清议', '整饬', '稳乡'],
        talent: ['荐才', '识人', '扬名', '引线'],
        heal: ['疗伤', '复军', '避损', '安营'],
        influence: ['造势', '观望', '牵线', '试探']
      };
      const variantList = variants[archetype] || variants.influence;
      const variant = variantList[hash % variantList.length];
      const scale = 1 + ((hash >>> 3) % 5) * 0.08;
      const risk = ['低', '中', '高'][(hash >>> 8) % 3];
      const cooldown = 3 + ((hash >>> 11) % 3);
      return { archetype, variant, scale, risk, cooldown, hash };
    }

    function specialSchemePreview(character, scheme) {
      const profile = specialSchemeProfile(character, scheme);
      const intro = {
        assault: '制造战场突破，压低敌军士气或守备。',
        command: '改善己方军令、士气与后续战役稳定性。',
        defense: '用于守城、救援或降低战役损耗。',
        scheme: '刺探、扰乱或破坏目标城的作战准备。',
        logistics: '补充粮草府库，支撑远征和围城。',
        diplomacy: '改善关系、降低敌意或提升名义正当性。',
        govern: '稳定地方、降低疑心，改善民心治安。',
        talent: '提高声望与情报，推动人才和线索出现。',
        heal: '恢复士气与伤兵，减少战后损耗。',
        influence: '制造地方影响，为后续交涉或谋略铺路。'
      }[profile.archetype] || '根据人物特长改变当前局势。';
      return character.name + '｜' + scheme + '<br>' +
        '<span style="color:var(--good)">效果：' + intro + '</span><br>' +
        '<span style="color:var(--warn)">风格：' + profile.variant + '｜风险：' + profile.risk + '｜冷却参考：' + profile.cooldown + ' 回合</span><br>' +
        '消耗 1 谋略点。成功率受人物属性、信任、尊重、情报网络和目标治安影响。';
    }

    function characterSpecialSchemeEntries(options = {}) {
      const includeLocked = !!options.includeLocked;
      return Object.values(gameState.characterRoster || {})
        .filter(character => character && getCharacterSpecialSchemes(character).length)
        .filter(character => includeLocked || specialSchemeUnlockState(character).unlocked)
        .flatMap(character => getCharacterSpecialSchemes(character).map((scheme, index) => ({
          character,
          scheme,
          index,
          state: specialSchemeUnlockState(character)
        })));
    }

    function renderCharacterSpecialSchemeList(character) {
      const schemes = getCharacterSpecialSchemes(character);
      if (!schemes.length) return '<p>尚未显露特殊谋略。</p>';
      const state = specialSchemeUnlockState(character);
      return `
        <div class="scheme-unlock-list">
          ${schemes.map(scheme => `
            <div class="turn-event-item">
              <strong>${escapeHtml(scheme)}</strong>
              <p class="muted">${state.unlocked ? specialSchemePreview(character, scheme) : state.reason + '｜当前信任 ' + Math.round(Number(character.trustPlayer || 0)) + '/' + Math.round(state.req.trust) + '，尊重 ' + Math.round(Number(character.respectPlayer || 0)) + '/' + Math.round(state.req.respect)}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderUnlockedSpecialSchemePanel(city, canReach) {
      const entries = characterSpecialSchemeEntries();
      if (!entries.length) {
        return '<div class="card"><h3>人物特殊谋略</h3><p class="muted">招募人物并提升信任、尊重后，会在这里出现他们的专属谋略。</p></div>';
      }
      return `
        <div class="card">
          <h3>人物特殊谋略</h3>
          <div class="button-grid">
            ${entries.map(entry => `<button data-scheme-action="specialCharacterScheme" data-target="${city.id}" data-scheme-character="${entry.character.id}" data-special-scheme="${escapeHtml(entry.scheme)}" ${canReach ? '' : 'disabled'} data-help="${escapeHtml(specialSchemePreview(entry.character, entry.scheme))}">${escapeHtml(entry.scheme)}｜${escapeHtml(entry.character.name)}</button>`).join('')}
          </div>
        </div>
      `;
    }

    function getCommanderBattleModifier(campaign) {
      const commander = getCampaignCommander(campaign);
      if (!commander) return { attack: 1, morale: 0, supply: 0, text: '' };

      const s = commander.stats || {};
      const command = Number(s.command || 50);
      const strategy = Number(s.strategy || 50);
      const loyalty = Number(s.loyalty || 50);
      const ambition = Number(s.ambition || 30);

      let attack = clamp(
        1 + (command - 50) * 0.006 + (strategy - 50) * 0.003 - Math.max(0, ambition - 80) * 0.002,
        0.9,
        1.35
      );

      const tags = getCharacterBattleTags(commander);
      const tagHits = [];
      const routeMode = campaign.routeMode || campaign.route || 'official';
      const army = campaign.army || troops(0, 0, 0, 0, 0);
      const armyTotal = Math.max(1, realTroops(army));
      const cavalryShare = Number(army.cavalry || 0) / armyTotal;
      const navyShare = Number(army.navy || 0) / armyTotal;
      if (tags.includes('善骑兵') && (cavalryShare >= 0.18 || ['raid', 'night'].includes(routeMode))) {
        attack *= 1.07;
        tagHits.push('骑兵');
      }
      if (tags.includes('善水战') && (navyShare >= 0.16 || routeMode === 'river')) {
        attack *= 1.08;
        tagHits.push('水战');
      }
      if (tags.includes('善突袭') && ['raid', 'night', 'cut'].includes(routeMode)) {
        attack *= 1.08;
        tagHits.push('突袭');
      }
      if (tags.includes('善陆战') && (!routeMode || ['official', 'raid'].includes(routeMode))) {
        attack *= 1.05;
        tagHits.push('陆战');
      }
      attack = clamp(attack, 0.9, 1.55);

      const morale = Math.round((command - 50) / 12 + (loyalty - 50) / 20 + tagHits.length * 0.5);
      const supply = Math.max(0, Math.round((strategy - 60) / 15 + (tags.includes('善水战') && routeMode === 'river' ? 1 : 0)));

      return {
        commander,
        attack,
        morale,
        supply,
        text: commander.name + '统军，攻势修正 ' + fmtPercent(attack) + (tagHits.length ? '（' + tagHits.join('、') + '）' : '')
      };
    }

    function shouldCommanderSaveSupply(campaign) {
      if (Number(campaign.supply || 0) <= 0) return false;

      const commander = getCampaignCommander(campaign);
      if (!commander) return false;

      const strategy = Number(commander.stats?.strategy || 50);
      let interval = 0;

      if (strategy >= 90) interval = 3;
      else if (strategy >= 78) interval = 4;
      else if (strategy >= 68) interval = 5;

      if (!interval) return false;

      campaign.commanderSupplyTick = (campaign.commanderSupplyTick || 0) + 1;

      if (campaign.commanderSupplyTick >= interval) {
        campaign.commanderSupplyTick = 0;
        return true;
      }

      return false;
    }

    function processCommanderCampaignActions(campaign, reports) {
      if (!campaign || campaign.faction !== 'player' || campaign.type !== 'attack' || campaign.status !== 'siege') {
        return { triggered: false, reason: 'not-player-siege' };
      }

      const commander = getCampaignCommander(campaign);
      if (!commander) {
        return { triggered: false, reason: 'no-commander' };
      }

      if (Number(campaign.commanderActionCooldown || 0) > 0) {
        return { triggered: false, reason: 'cooldown' };
      }

      const target = gameState.cities?.[campaign.target];
      if (!target) {
        return { triggered: false, reason: 'no-target' };
      }

      const stats = commander.stats || {};
      const command = Number(stats.command || 50);
      const strategy = Number(stats.strategy || 50);
      const charm = Number(stats.charm || 50);
      const loyalty = Number(stats.loyalty || 50);

      let chance = 20;
      if (strategy >= 70) chance += 10;
      if (command >= 70) chance += 8;
      if (['名将', '传奇'].includes(commander.rarity)) chance += 8;
      chance = clamp(chance, 15, 45);

      if (Math.random() * 100 >= chance) {
        return { triggered: false, reason: 'chance-failed', chance };
      }

      const actions = [];

      if (strategy >= 65) {
        actions.push({
          id: 'cutSupply',
          text: commander.name + '遣细作绕袭粮道，' + target.name + '粮草受损，守军士气动摇。',
          run: function() {
            target.food = Math.max(0, Number(target.food || 0) - Math.round(120 + strategy * 2));
            target.morale = clamp(Number(target.morale || 0) - 2, 0, 100);
          }
        });
      }

      if (strategy >= 60 || charm >= 65) {
        actions.push({
          id: 'disturbDefenders',
          text: commander.name + '散布虚实消息，扰乱' + target.name + '守军。',
          run: function() {
            target.morale = clamp(Number(target.morale || 0) - 4, 0, 100);
            target.defense = clamp(Number(target.defense || 0) - 1, 0, 100);
          }
        });
      }

      if (command >= 70) {
        actions.push({
          id: 'stormOuterCamp',
          text: commander.name + '亲督锐卒强攻外营，敌城防线受损，我军亦有折损。',
          run: function() {
            target.defense = clamp(Number(target.defense || 0) - 2, 0, 100);

            const loss = Math.max(20, Math.round(realTroops(campaign.army) * 0.08));
            removeTroops(campaign.army, loss);

            if (Math.random() < 0.5) {
              campaign.siegeRemaining = Math.max(0, Number(campaign.siegeRemaining || 0) - 1);
            }
          }
        });
      }

      if (loyalty >= 65 || command >= 65) {
        actions.push({
          id: 'steadyArmy',
          text: commander.name + '巡营整伍，稳定军心，前线补给得以维持。',
          run: function() {
            campaign.supply = Math.max(0, Number(campaign.supply || 0) + 1);
          }
        });
      }

      if (!actions.length) {
        return { triggered: false, reason: 'no-available-action', chance };
      }

      const action = actions[Math.floor(Math.random() * actions.length)];
      action.run();
      finishCampaignIfArmyGone(campaign, reports, '前线强攻损耗殆尽');

      campaign.commanderActionCooldown = 2;

      if (reports) {
        reports.push({
          tone: 'good',
          text: '主将谋划：' + action.text
        });
      }

      return {
        triggered: true,
        action: action.id,
        commanderId: commander.id,
        commanderName: commander.name,
        chance
      };
    }

    function findCharacterAppointment(characterId) {
      const app = normalizeAppointments(gameState);

      for (const [cityId, slots] of Object.entries(app.cityOfficials || {})) {
        if ((slots.administratorIds || []).includes(characterId) || slots.administratorId === characterId) {
          return { type: 'city', cityId, slot: 'administratorId' };
        }
        if ((slots.militaryOfficerIds || []).includes(characterId) || slots.militaryOfficerId === characterId) {
          return { type: 'city', cityId, slot: 'militaryOfficerId' };
        }
        if (slots.policyOfficerId === characterId) {
          return { type: 'city', cityId, slot: 'policyOfficerId' };
        }
      }

      for (const [campaignId, id] of Object.entries(app.campaignCommanders || {})) {
        if (id === characterId) return { type: 'campaign', campaignId };
      }

      return null;
    }

    function getUnassignedRecruitedCharacters(filter = {}) {
      normalizeAppointments(gameState);

      return Object.values(gameState.characterRoster || {})
        .filter(c =>
          c &&
          c.status === 'recruited' &&
          isExternalCharacter(c) &&
          !(typeof isFactionLordCharacter === 'function' && isFactionLordCharacter(c)) &&
          !findCharacterAppointment(c.id)
        )
        .filter(c => {
          if (filter.role === 'administratorId') return canManageCity(c);
          if (filter.role === 'policyOfficerId') return canManageCity(c);
          if (filter.role === 'militaryOfficerId') return canLeadArmy(c);
          if (filter.role === 'campaignCommander') return canLeadArmy(c);
          return true;
        });
    }

    function appointmentRoleLabel(role) {
      if (role === 'administratorId') return '主政官';
      if (role === 'militaryOfficerId') return '军事官';
      if (role === 'policyOfficerId') return '政策官';
      if (role === 'campaignCommander') return '战役主将';
      return '官员';
    }

    function openAppointmentPicker({ cityId, role, campaignId }) {
      const candidates = getUnassignedRecruitedCharacters({
        role: role || (campaignId ? 'campaignCommander' : '')
      });

      gameState.activeModal = {
        type: 'appointmentPicker',
        cityId,
        role,
        campaignId,
        candidates: candidates.map(c => c.id)
      };

      renderModal();
    }

    function appointmentCityControllerFromState(state, cityId) {
      const city = state.cities?.[cityId];
      return city?.controller || city?.actual || city?.faction || city?.owner || 'local';
    }

    function cleanupInvalidAppointments(state = gameState) {
      const app = normalizeAppointments(state);

      // 清理 cityOfficials 和 autoTasks
      for (const cityId of Object.keys(app.cityOfficials)) {
        const city = state.cities?.[cityId];
        const controller = appointmentCityControllerFromState(state, cityId);

        if (!city || city.isActive === false || controller !== 'player') {
          delete app.cityOfficials[cityId];
          delete app.autoTasks?.[cityId];
          continue;
        }
        const slots = app.cityOfficials[cityId];
        const validAdmin = charId => {
          const char = state.characterRoster?.[charId];
          return char && !isInternalPlayerCharacterId(charId) && char.status === 'recruited' && !['dead', 'captured'].includes(char.status) && canManageCity(char);
        };
        const validMilitary = charId => {
          const char = state.characterRoster?.[charId];
          return char && !isInternalPlayerCharacterId(charId) && char.status === 'recruited' && !['dead', 'captured'].includes(char.status) && canLeadArmy(char);
        };
        slots.administratorIds = [...new Set((slots.administratorIds || (slots.administratorId ? [slots.administratorId] : [])).filter(validAdmin))];
        slots.militaryOfficerIds = [...new Set((slots.militaryOfficerIds || (slots.militaryOfficerId ? [slots.militaryOfficerId] : [])).filter(validMilitary))];
        slots.administratorId = slots.administratorIds[0] || null;
        slots.militaryOfficerId = slots.militaryOfficerIds[0] || null;
        if (slots.policyOfficerId) {
          const char = state.characterRoster?.[slots.policyOfficerId];
          if (!char || isInternalPlayerCharacterId(slots.policyOfficerId) || char.status !== 'recruited' || ['dead', 'captured'].includes(char.status) || !canManageCity(char)) {
            slots.policyOfficerId = null;
          }
        }
      }

      // 清理 autoTasks 中不属于玩家的城市
      for (const cityId of Object.keys(app.autoTasks || {})) {
        const city = state.cities?.[cityId];
        const controller = appointmentCityControllerFromState(state, cityId);
        if (!city || city.isActive === false || controller !== 'player') {
          delete app.autoTasks[cityId];
        }
      }

      // 清理 campaignCommanders
      for (const campaignId of Object.keys(app.campaignCommanders)) {
        const campaign = (state.campaigns || []).find(c => c.id === campaignId);
        if (!campaign || campaign.faction !== 'player' || campaign.type !== 'attack' || !isActiveCampaign(campaign)) {
          delete app.campaignCommanders[campaignId];
          continue;
        }
        const charId = app.campaignCommanders[campaignId];
        if (charId) {
          const char = state.characterRoster?.[charId];
          if (!char || isInternalPlayerCharacterId(charId) || char.status !== 'recruited' || ['dead', 'captured'].includes(char.status)) {
            delete app.campaignCommanders[campaignId];
          }
        }
      }
    }

    function appointCityOfficial(cityId, slot, characterId) {
      if (!['administratorId', 'militaryOfficerId', 'policyOfficerId'].includes(slot)) {
        return toast('无效的职位类型');
      }
      const city = gameState.cities?.[cityId];
      if (!city || !isActiveMapCity(cityId) || cityController(cityId) !== 'player') {
        return toast('该城池不属于你');
      }
      const character = gameState.characterRoster?.[characterId];
      if (!character || !canBeAppointed(character)) {
        return toast('该人物不可被任命');
      }
      if (slot === 'administratorId' || slot === 'policyOfficerId') {
        if (!canManageCity(character)) return toast('主政和政策官只能由政务、谋士、名士担任');
      }
      if (slot === 'militaryOfficerId') {
        if (!canLeadArmy(character)) return toast('军事官只能由武将、谋士担任');
      }
      const existing = findCharacterAppointment(characterId);
      if (existing) return toast('此人已有任命，请先撤任。');

      normalizeAppointments(gameState);
      gameState.appointments.cityOfficials[cityId] ||= {};
      const slots = gameState.appointments.cityOfficials[cityId];
      if (slot === 'administratorId') {
        slots.administratorIds ||= [];
        if (slots.administratorIds.length >= getCityAdministratorLimit(city)) return toast('该城主政官已满');
        slots.administratorIds.push(characterId);
        slots.administratorId = slots.administratorIds[0] || null;
      } else if (slot === 'militaryOfficerId') {
        slots.militaryOfficerIds ||= [];
        if (slots.militaryOfficerIds.length >= getCityMilitaryOfficerLimit(city)) return toast('该城军事官已满');
        slots.militaryOfficerIds.push(characterId);
        slots.militaryOfficerId = slots.militaryOfficerIds[0] || null;
      } else {
        slots.policyOfficerId = characterId;
      }
      cleanupInvalidAppointments();
      saveToStorage(false);
      render();
    }

    function removeCityOfficialAt(cityId, role, characterId) {
      normalizeAppointments(gameState);
      const slots = gameState.appointments.cityOfficials?.[cityId];
      if (!slots) return;

      if (role === 'administratorId') {
        slots.administratorIds = (slots.administratorIds || []).filter(id => id !== characterId);
        slots.administratorId = slots.administratorIds[0] || null;
      } else if (role === 'militaryOfficerId') {
        slots.militaryOfficerIds = (slots.militaryOfficerIds || []).filter(id => id !== characterId);
        slots.militaryOfficerId = slots.militaryOfficerIds[0] || null;
      } else if (role === 'policyOfficerId') {
        slots.policyOfficerId = null;
      }

      cleanupInvalidAppointments();
      saveToStorage(false);
      render();
    }

    function removeCityOfficial(cityId, slot, characterId) {
      if (!['administratorId', 'militaryOfficerId', 'policyOfficerId'].includes(slot)) {
        return toast('无效的职位类型');
      }
      if (characterId) return removeCityOfficialAt(cityId, slot, characterId);
      normalizeAppointments(gameState);
      const officials = gameState.appointments.cityOfficials[cityId];
      if (officials) {
        if (slot === 'administratorId') {
          officials.administratorIds = [];
          officials.administratorId = null;
        } else if (slot === 'militaryOfficerId') {
          officials.militaryOfficerIds = [];
          officials.militaryOfficerId = null;
        } else {
          officials[slot] = null;
        }
      }
      cleanupInvalidAppointments();
      saveToStorage(false);
      render();
    }

    function appointCampaignCommander(campaignId, characterId) {
      const campaign = (gameState.campaigns || []).find(c => c.id === campaignId);
      if (!campaign) return toast('战役不存在');
      if (campaign.faction !== 'player') return toast('只能任命我方战役的主将');
      if (campaign.type !== 'attack') return toast('只能为进攻战役任命主将');
      if (!isActiveCampaign(campaign)) return toast('该战役已结束或未激活');
      const character = gameState.characterRoster?.[characterId];
      if (!character || !canBeAppointed(character)) {
        return toast('该人物不可被任命');
      }
      if (!canLeadArmy(character)) return toast('主将只能由武将、谋士担任');
      const existing = findCharacterAppointment(characterId);
      if (existing) return toast('此人已有任命，请先撤任。');

      normalizeAppointments(gameState);
      gameState.appointments.campaignCommanders[campaignId] = characterId;
      campaign.commanderSupplyTick = 0;
      cleanupInvalidAppointments();
      saveToStorage(false);
      render();
    }

    function removeCampaignCommander(campaignId) {
      normalizeAppointments(gameState);
      delete gameState.appointments.campaignCommanders[campaignId];
      const campaign = gameState.campaigns?.find(c => c.id === campaignId);
      if (campaign) campaign.commanderSupplyTick = 0;
      cleanupInvalidAppointments();
      saveToStorage(false);
      render();
    }

    const CHARACTER_STATUS_RANK = {
      hidden: 0,
      rumored: 1,
      discovered: 2,
      contactable: 3,
      recruited: 4,
      dead: -1,
      captured: -1
    };

    function promoteCharacterStatus(current, next) {
      const currentRank = CHARACTER_STATUS_RANK[current] ?? 0;
      const nextRank = CHARACTER_STATUS_RANK[next] ?? 1;
      return nextRank > currentRank ? next : current;
    }

    function revealCharacter(characterId, status = 'rumored', reason = '') {
      const character = gameState.characterRoster?.[characterId];
      if (!character || isInternalPlayerCharacterId(characterId)) return false;

      const allowed = ['rumored', 'discovered', 'contactable', 'recruited'];
      const nextStatus = allowed.includes(status) ? status : 'rumored';

      const promoted = promoteCharacterStatus(character.status, nextStatus);
      if (promoted !== character.status) {
        character.status = promoted;
      }

      if (reason) {
        character.discoveredBy = reason;
      } else if (!character.discoveredBy) {
        character.discoveredBy = '传闻';
      }

      addCharacterMemory?.(character, {
        turn: gameState.turn,
        type: 'discovery',
        summary: '因' + (reason || '传闻') + '被玩家得知。',
        text: '因' + (reason || '传闻') + '被玩家得知。'
      });

      return true;
    }

    function promoteRumoredCharacter(characterId, reason = '调查传闻') {
      const character = gameState.characterRoster?.[characterId];
      if (!character || isInternalPlayerCharacterId(characterId)) return false;

      if (character.status !== 'rumored') {
        toast('此人不需要调查');
        return false;
      }

      character.status = 'contactable';
      character.discoveredBy = reason;

      gameState.selectedCharacterId = characterId;
      gameState.characterFilter = 'contactable';
      gameState.characterProfileId = characterId;

      addCharacterMemory?.(character, {
        turn: gameState.turn,
        type: 'discovery',
        summary: '通过' + reason + '确认其行踪。',
        text: '通过' + reason + '确认其行踪。'
      });

      toast(character.name + '的行踪已经确认，可以尝试接触。');
      saveToStorage(false);
      render();
      return true;
    }

    function investigateCharacter(characterId) {
      const character = gameState.characterRoster?.[characterId];

      if (!character) return toast('未找到此人');
      if (isInternalPlayerCharacterId(characterId)) return toast('内部班底不需要调查');
      if (character.status !== 'rumored') return toast('此人不需要调查');

      if (isTabUnlocked('scheme')) {
        if (!spendPoint('scheme')) return;
        promoteRumoredCharacter(characterId, '谋略调查');
        return;
      }

      if (isTabUnlocked('inner')) {
        if (!spendPoint('inner')) return;
        promoteRumoredCharacter(characterId, '亲信打探');
        return;
      }

      toast('需要先解锁亲信或谋略系统，才能调查人物传闻');
    }

    function characterRevealPriority(character) {
      let score = 0;
      if (character.rarity === '传奇') score += 30;
      if (character.rarity === '名将') score += 18;
      if (character.type === '谋士') score += 8;
      if (character.type === '武将') score += 6;
      if (character.location && gameState.cities?.[character.location]) score += 5;
      return score;
    }

    function unlockCharactersByFaction(factionId, reason = '', limit = 4) {
      const candidates = Object.values(gameState.characterRoster || {})
        .filter(c => isExternalCharacter(c))
        .filter(c => c.faction === factionId)
        .filter(c => c.status === 'hidden')
        .filter(c => c.status !== 'dead' && c.status !== 'captured')
        .sort((a, b) => characterRevealPriority(b) - characterRevealPriority(a));

      let count = 0;
      candidates.forEach(character => {
        if (count >= limit) return;
        character.status = 'rumored';
        character.discoveredBy = reason || '天下大事';
        count++;
      });

      return count;
    }

    function getCurrentBorderFactions() {
      const result = new Set();

      controlledCities().forEach(city => {
        cityNeighborIds(city.id).forEach(neighborId => {
          const neighbor = gameState.cities?.[neighborId];
          if (!neighbor) return;

          const factionId = cityController(neighborId);
          if (!factionId || factionId === 'player' || factionId === 'local') return;

          result.add(factionId);
        });
      });

      return Array.from(result);
    }

    function pushCharacterDiscoveryReport(count, reason, reports) {
      if (!count || !reports) return;
      reports.push({
        tone: 'good',
        level: 'minor',
        text: reason + '，' + count + ' 名历史人物进入传闻。'
      });
    }

    function checkNewBorderFactions(reports) {
      gameState.knownBorderFactions ||= [];

      const current = getCurrentBorderFactions();
      const known = new Set(gameState.knownBorderFactions);
      let total = 0;

      current.forEach(factionId => {
        if (known.has(factionId)) return;
        gameState.knownBorderFactions.push(factionId);
        const count = unlockCharactersByFaction(factionId, '与该势力接壤', 3);
        total += count;
        pushCharacterDiscoveryReport(count, '与' + factionName(factionId) + '接壤', reports);
      });

      return total;
    }

    function checkIntelligenceNetworkUnlocks(reports) {
      gameState.characterUnlockFlags ||= {};

      const network = gameState.characters?.retinue?.network || 0;
      let total = 0;

      if (network >= 30 && !gameState.characterUnlockFlags.intel30) {
        gameState.characterUnlockFlags.intel30 = true;
        const count = [
          revealCharacter('siMaHui', 'rumored', '荆州名士传闻'),
          revealCharacter('pangDeGong', 'rumored', '荆州名士传闻'),
          revealCharacter('huangChengYan', 'rumored', '荆州名士传闻')
        ].filter(Boolean).length;
        total += count;
        pushCharacterDiscoveryReport(count, '情报网达到 30，荆州名士传闻浮现', reports);
      }

      if (network >= 60 && !gameState.characterUnlockFlags.intel60) {
        gameState.characterUnlockFlags.intel60 = true;
        const count = [
          revealCharacter('zhugeLiang', 'rumored', '情报网络探知'),
          revealCharacter('pangTong', 'rumored', '情报网络探知'),
          revealCharacter('xuShu', 'rumored', '情报网络探知')
        ].filter(Boolean).length;
        total += count;
        pushCharacterDiscoveryReport(count, '情报网达到 60，隆中线索被探知', reports);
      }

      if (network >= 90 && !gameState.characterUnlockFlags.intel90) {
        gameState.characterUnlockFlags.intel90 = true;
        const count = [
          revealCharacter('zhugeLiang', 'discovered', '情报详查'),
          revealCharacter('pangTong', 'discovered', '情报详查'),
          revealCharacter('xuShu', 'discovered', '情报详查')
        ].filter(Boolean).length;
        total += count;
        pushCharacterDiscoveryReport(count, '情报网达到 90，隆中人物行踪更清晰', reports);
      }

      return total;
    }

    function getDiplomacyActionFaction(action) {
      const map = {
        allyLiu: 'liubiao',
        useGongsun: 'gongsun',
        caoFood: 'cao',
        sunTrade: 'sun',
        yuanContact: 'yuan',
        liuzhangEnvoy: 'liuzhang',
        zhangluEnvoy: 'zhanglu',
        matengContact: 'mateng',
        yuanshuContact: 'yuanshu'
      };
      return map[action] || null;
    }

    function maybeRevealCharactersFromWar(factionId, campaign, reports) {
      if (!campaign) return 0;
      if (!factionId || factionId === 'player' || factionId === 'local') return 0;
      if (campaign.visibility === 'hidden') return 0;
      if (['raid', 'night', 'stealth'].includes(campaign.routeMode)) return 0;

      gameState.characterUnlockFlags ||= {};
      gameState.characterUnlockFlags.warRevealTurnByFaction ||= {};

      const last = gameState.characterUnlockFlags.warRevealTurnByFaction[factionId] ?? -99;
      if (gameState.turn - last < 5) return 0;

      gameState.characterUnlockFlags.warRevealTurnByFaction[factionId] = gameState.turn;
      const count = unlockCharactersByFaction(factionId, '天下战事', 2);
      pushCharacterDiscoveryReport(count, factionName(factionId) + '卷入公开战事', reports);
      return count;
    }

    function processCharacterDiscoveryTriggers(reports) {
      let total = 0;
      total += checkNewBorderFactions(reports) || 0;
      total += checkIntelligenceNetworkUnlocks(reports) || 0;
      return total;
    }

    function isMajorNpcForInitiative(character) {
      if (!isExternalCharacter(character)) return false;
      if (!character || character.status === 'hidden' || character.status === 'dead' || character.status === 'captured') return false;

      if (character.status === 'recruited') return true;
      if (character.status === 'contactable') return true;
      if (character.status === 'discovered') return true;

      if (character.status === 'rumored') {
        return character.rarity === '传奇'
          && !!character.discoveredBy
          && Number(character.attitudeToPlayer || 0) >= 58;
      }

      return false;
    }

    function triggerScholarRecommendation() {
      revealCharacter('siMaHui', 'discovered', '荆州名士传闻');
      revealCharacter('zhugeLiang', 'rumored', '水镜先生荐才');
      revealCharacter('pangTong', 'rumored', '水镜先生荐才');
      revealCharacter('xuShu', 'rumored', '水镜先生荐才');
      toast('荆州名士传闻渐起。');
      render();
    }

    function revealAllHistoricalCharacters() {
      Object.values(gameState.characterRoster || {}).forEach(c => {
        if (!isInternalPlayerCharacterId(c.id) && c.status === 'hidden') {
          c.status = 'rumored';
          c.discoveredBy = '调试解锁';
        }
      });
      render();
    }

    const BASE_CHARACTER_BLUEPRINTS = {
      guardCaptain: characterBlueprint('guardCaptain', '亲兵统领', { faction: 'player', role: '亲信', type: '武将', status: 'recruited', rarity: '良才', summary: '负责统领桂阳亲兵，性情直爽。', stats: { command: 68, strategy: 42, politics: 32, charm: 44, loyalty: 78, ambition: 20 }, passiveBonuses: ['训练郡兵效率提高'] }),
      chiefClerk: characterBlueprint('chiefClerk', '主簿', { faction: 'player', role: '亲信', type: '政务', status: 'recruited', rarity: '良才', summary: '熟悉文书、士族与府衙脉络。', stats: { command: 34, strategy: 57, politics: 72, charm: 58, loyalty: 74, ambition: 24 }, passiveBonuses: ['整顿治安效果提高'] }),
      quartermaster: characterBlueprint('quartermaster', '粮官', { faction: 'player', role: '亲信', type: '政务', status: 'recruited', rarity: '普通', summary: '掌管军粮和屯田账册。', stats: { command: 30, strategy: 46, politics: 66, charm: 40, loyalty: 70, ambition: 18 }, passiveBonuses: ['行军补给损耗降低'] }),
      scoutChief: characterBlueprint('scoutChief', '斥候头目', { faction: 'player', role: '亲信', type: '谋士', status: 'recruited', rarity: '良才', summary: '负责打探豪强往来与道路虚实。', stats: { command: 48, strategy: 68, politics: 38, charm: 46, loyalty: 71, ambition: 26 }, passiveBonuses: ['截击风险降低'] }),
      liuBiao: characterBlueprint('liuBiao', '刘表', { faction: 'liubiao', location: 'xiangyang', role: '荆州牧', title: '荆州牧', type: '政务', status: 'contactable', rarity: '传奇', summary: '坐镇襄阳，给予你立足荆南的庇护。', portraitUrl: './assets/characters/liu-biao.png', stats: { command: 64, strategy: 72, politics: 84, charm: 80, loyalty: 58, ambition: 62 }, specialSchemes: ['刘表密谈', '请求兵粮'] }),
      caiMao: characterBlueprint('caiMao', '蔡瑁', { faction: 'liubiao', location: 'xiangyang', role: '荆州士族', type: '武将', status: 'discovered', rarity: '名将', summary: '荆州军政要员，对桂阳的新变化保持警惕。', stats: { command: 72, strategy: 58, politics: 64, charm: 48, loyalty: 56, ambition: 66 } }),
      kuaiYue: characterBlueprint('kuaiYue', '蒯越', { faction: 'liubiao', location: 'xiangyang', role: '荆州谋臣', type: '谋士', status: 'contactable', rarity: '名将', summary: '识人审势，习惯先观察再下注。', stats: { command: 42, strategy: 86, politics: 80, charm: 68, loyalty: 62, ambition: 48 }, specialSchemes: ['谋士献策', '煮酒论英雄'] }),
      huangZu: characterBlueprint('huangZu', '黄祖', { faction: 'liubiao', location: 'jiangxia', role: '江夏守将', type: '武将', status: 'discovered', rarity: '名将', summary: '久镇江夏，重视水路和守备。', stats: { command: 76, strategy: 56, politics: 42, charm: 44, loyalty: 66, ambition: 40 } }),
      wenPin: characterBlueprint('wenPin', '文聘', { faction: 'liubiao', location: 'xiangyang', role: '荆州将领', type: '武将', status: 'contactable', rarity: '名将', summary: '治军严整，重视信用与军令。', stats: { command: 82, strategy: 64, politics: 48, charm: 58, loyalty: 78, ambition: 30 }, specialSchemes: ['将军请战'] }),
      guiyangClans: characterBlueprint('guiyangClans', '桂阳豪强', { faction: 'local', role: '地方势力', type: '豪强', status: 'contactable', rarity: '良才', summary: '盘踞乡里，既可安抚，也可能成为隐患。', stats: { command: 52, strategy: 48, politics: 58, charm: 60, loyalty: 30, ambition: 64 }, specialSchemes: ['夜访桂阳'] }),
      jingnanGentry: characterBlueprint('jingnanGentry', '荆南士族代表', { faction: 'local', location: 'changsha', role: '士族代表', type: '政务', status: 'contactable', rarity: '良才', summary: '在荆南郡县间拥有声望和人脉。', stats: { command: 30, strategy: 62, politics: 74, charm: 68, loyalty: 38, ambition: 48 } }),
      localOfficials: characterBlueprint('localOfficials', '地方郡吏', { faction: 'local', role: '地方郡吏', type: '政务', status: 'contactable', rarity: '普通', summary: '熟悉桂阳府衙日常运作。', stats: { command: 28, strategy: 46, politics: 64, charm: 48, loyalty: 48, ambition: 32 } }),
      caoCao: characterBlueprint('caoCao', '曹操', { faction: 'cao', location: 'xuchang', role: '兖豫诸侯', type: '谋士', status: 'hidden', rarity: '传奇', summary: '中原强势诸侯。' }),
      sunQuan: characterBlueprint('sunQuan', '孙权', { faction: 'sun', location: 'jianye', role: '江东之主', type: '政务', status: 'hidden', rarity: '传奇', summary: '江东后续的重要势力。' }),
      liuBei: characterBlueprint('liuBei', '刘备', { faction: 'liu', location: 'xiaopei', role: '汉室宗亲', type: '武将', status: 'hidden', rarity: '传奇', summary: '暂未进入你的交涉圈。' }),
      yuanShao: characterBlueprint('yuanShao', '袁绍', { faction: 'yuan', location: 'yecheng', role: '河北之主', title: '大将军', type: '政务', status: 'hidden', rarity: '传奇', portraitUrl: './assets/characters/yuan-shao.png', summary: '四世三公，雄踞河北，兵多将广却优柔寡断，官渡一战后走向覆灭。', stats: { command: 72, strategy: 68, politics: 82, charm: 84, loyalty: 58, ambition: 86 }, personality: { brave: 48, cautious: 38, greedy: 52, loyal: 52, proud: 88, ruthless: 44, idealistic: 32 }, values: ['门第', '声望', '权势'], boundaries: ['不受屈辱', '不容人轻视'], longTermGoal: '以袁氏门第威望统一北方', privateAgenda: '证明四世三公之后才是天下正统', speechStyle: { register: '傲慢', rhythm: '迟缓', habit: '好谋无断', metaphor: '旗与势' }, specialSchemes: ['联络豪强', '讨伐檄文'], passiveBonuses: ['麾下武将初始忠诚度较高'], weaknesses: ['优柔寡断', '宠信佞臣', '不纳忠谏'], recruitmentDifficulty: 95, defectionTriggers: [] })
    };

    const HISTORICAL_CHARACTER_PACKS = {
      liu: [
        { id: 'guanYu', name: '关羽', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xiaopei', role: '万人敌', title: '虎臣', type: '武将', status: 'hidden', rarity: '传奇', summary: '关羽以忠义与武勇闻名，善统精兵，傲气极重。', stats: { command: 96, strategy: 72, politics: 42, charm: 70, loyalty: 96, ambition: 38 }, personality: { brave: 96, cautious: 36, greedy: 18, loyal: 98, proud: 88, ruthless: 30, idealistic: 80 }, values: ['忠诚', '武名', '义气'], boundaries: ['不事二主', '不屈辱求全'], longTermGoal: '辅佐明主，成就忠义之名', privateAgenda: '观察主君是否值得托付生死', speechStyle: { register: '刚正', rhythm: '简洁', habit: '言辞带压迫感', metaphor: '刀与义' }, specialSchemes: ['威震敌胆', '单骑压阵'], passiveBonuses: ['同阵营武将士气提高'], weaknesses: ['傲气重', '轻视寻常将领'], recruitmentDifficulty: 92, defectionTriggers: [] },
        { id: 'zhangFei', name: '张飞', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xiaopei', role: '猛将', title: '万人敌', type: '武将', status: 'hidden', rarity: '传奇', summary: '张飞勇猛无双，性烈如火，然敬君子而不恤小人。', stats: { command: 92, strategy: 48, politics: 28, charm: 54, loyalty: 94, ambition: 30 }, personality: { brave: 98, cautious: 16, greedy: 22, loyal: 94, proud: 72, ruthless: 56, idealistic: 50 }, values: ['忠义', '勇武', '豪爽'], boundaries: ['不背兄长', '不惧强敌'], longTermGoal: '随兄长征战天下', privateAgenda: '以勇力证明自己非只莽夫', speechStyle: { register: '粗豪', rhythm: '短促', habit: '声大气粗', metaphor: '雷与火' }, specialSchemes: ['据水断桥', '怒吼破胆'], passiveBonuses: ['冲锋时敌军士气下降'], weaknesses: ['暴虐士卒', '酒后失德'], recruitmentDifficulty: 88, defectionTriggers: [] },
        { id: 'zhugeLiang', name: '诸葛亮', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xinye', offMapLocation: 'longzhong', role: '卧龙', title: '军师', type: '谋士', status: 'hidden', rarity: '传奇', summary: '卧龙诸葛亮，未出茅庐已知三分天下。', stats: { command: 78, strategy: 98, politics: 96, charm: 88, loyalty: 92, ambition: 36 }, personality: { brave: 52, cautious: 82, greedy: 10, loyal: 94, proud: 60, ruthless: 28, idealistic: 88 }, values: ['天下苍生', '忠诚', '谋略'], boundaries: ['不事不明之主', '不违本心'], longTermGoal: '辅佐明主，兴复汉室', privateAgenda: '寻值得托付的明主以施展平生所学', speechStyle: { register: '儒雅', rhythm: '从容', habit: '引古喻今', metaphor: '风与棋' }, specialSchemes: ['空城计', '火烧博望', '草船借箭'], passiveBonuses: ['谋略成功率大幅提高'], weaknesses: ['事必躬亲', '过于谨慎'], recruitmentDifficulty: 96, defectionTriggers: [] },
        { id: 'pangTong', name: '庞统', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xinye', offMapLocation: 'longzhong', role: '凤雏', title: '副军师', type: '谋士', status: 'hidden', rarity: '传奇', summary: '凤雏庞统，与卧龙齐名，善出奇谋。', stats: { command: 72, strategy: 94, politics: 80, charm: 62, loyalty: 78, ambition: 48 }, personality: { brave: 58, cautious: 42, greedy: 28, loyal: 72, proud: 74, ruthless: 50, idealistic: 60 }, values: ['奇谋', '功名', '证明自己'], boundaries: ['不甘居人下', '不守常规'], longTermGoal: '以奇谋建功立业，证明凤雏不逊卧龙', privateAgenda: '急于证明才能超越诸葛亮', speechStyle: { register: '狂放', rhythm: '跳跃', habit: '言辞尖锐', metaphor: '火与险' }, specialSchemes: ['连环计', '献策取蜀'], passiveBonuses: ['奇谋成功时额外收益'], weaknesses: ['急功近利', '貌陋易遭轻视'], recruitmentDifficulty: 82, defectionTriggers: [] },
        { id: 'xuShu', name: '徐庶', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu', 'cao'], location: 'xinye', role: '游侠谋士', title: '军师', type: '谋士', status: 'hidden', rarity: '名将', summary: '徐庶先为游侠后为谋士，因母被执而被迫归曹。', stats: { command: 56, strategy: 88, politics: 68, charm: 74, loyalty: 72, ambition: 32 }, personality: { brave: 68, cautious: 56, greedy: 14, loyal: 82, proud: 40, ruthless: 20, idealistic: 70 }, values: ['孝义', '知己', '忠信'], boundaries: ['不为曹操献一策', '不以孝换功名'], longTermGoal: '守孝义之名，不仕不义之主', privateAgenda: '身在曹营心在汉，终身不设一谋', speechStyle: { register: '沉稳', rhythm: '舒缓', habit: '话少意深', metaphor: '归路与母' }, specialSchemes: ['走马荐诸葛'], passiveBonuses: ['识人能力提高'], weaknesses: ['孝心过重可被利用', '终不设谋'], recruitmentDifficulty: 78, defectionTriggers: ['母亲被执'] },
        { id: 'jianYong', name: '简雍', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xiaopei', role: '旧友', title: '幕僚', type: '谋士', status: 'hidden', rarity: '良才', summary: '刘备同乡旧友，善辩辞，性情洒脱。', stats: { command: 34, strategy: 62, politics: 58, charm: 76, loyalty: 82, ambition: 22 }, personality: { brave: 40, cautious: 34, greedy: 20, loyal: 84, proud: 30, ruthless: 12, idealistic: 52 }, values: ['故旧情谊', '自由', '洒脱'], boundaries: ['不弃旧主', '不拘礼法'], longTermGoal: '随刘备周旋，享逍遥人生', privateAgenda: '用幽默化解紧张局面', speechStyle: { register: '诙谐', rhythm: '随意', habit: '善用比喻说理', metaphor: '酒与闲' }, specialSchemes: ['巧言说服'], passiveBonuses: ['外交谈判效果提高'], weaknesses: ['不擅军务', '散漫无拘'], recruitmentDifficulty: 40, defectionTriggers: [] },
        { id: 'miZhu', name: '糜竺', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xiaopei', role: '豪门商贾', title: '别驾', type: '政务', status: 'hidden', rarity: '良才', summary: '徐州巨商，倾家助刘备，忠厚长者。', stats: { command: 28, strategy: 52, politics: 70, charm: 78, loyalty: 90, ambition: 18 }, personality: { brave: 30, cautious: 64, greedy: 20, loyal: 92, proud: 28, ruthless: 8, idealistic: 56 }, values: ['忠诚', '家业', '仁义'], boundaries: ['不背刘备', '不亏待士卒'], longTermGoal: '保全家族并辅佐刘备', privateAgenda: '用商贾资源支撑刘备基业', speechStyle: { register: '谦恭', rhythm: '平稳', habit: '以利弊分析进言', metaphor: '金与粮' }, specialSchemes: ['倾财助军'], passiveBonuses: ['商路收入提高'], weaknesses: ['无军事才能', '过于依赖刘备'], recruitmentDifficulty: 35, defectionTriggers: [] },
        { id: 'sunQian', name: '孙乾', faction: 'liu', originFaction: 'liu', possibleFactions: ['liu'], location: 'xiaopei', role: '外交幕僚', title: '从事', type: '政务', status: 'hidden', rarity: '良才', summary: '刘备早期幕僚，善往来交涉，忠心耿耿。', stats: { command: 26, strategy: 50, politics: 64, charm: 72, loyalty: 86, ambition: 16 }, personality: { brave: 32, cautious: 60, greedy: 14, loyal: 88, proud: 22, ruthless: 10, idealistic: 48 }, values: ['忠诚', '和气', '务实'], boundaries: ['不背主', '不挑事'], longTermGoal: '辅佐刘备站稳脚跟', privateAgenda: '在外交上为刘备争取喘息之机', speechStyle: { register: '谦和', rhythm: '平稳', habit: '先赞对方再提己方诉求', metaphor: '桥与路' }, specialSchemes: ['奔走求援'], passiveBonuses: ['外交出使成功率提高'], weaknesses: ['军事能力不足', '性格过于温和'], recruitmentDifficulty: 32, defectionTriggers: [] }
      ],
      cao: [
        { id: 'zhangLiao', name: '张辽', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '五子良将之首', title: '征东将军', type: '武将', status: 'hidden', rarity: '传奇', summary: '张辽文远，合肥之战以八百破十万，威震逍遥津。', stats: { command: 92, strategy: 76, politics: 48, charm: 70, loyalty: 82, ambition: 40 }, personality: { brave: 94, cautious: 58, greedy: 18, loyal: 80, proud: 52, ruthless: 36, idealistic: 50 }, values: ['军功', '信义', '勇武'], boundaries: ['不背信弃义', '不临阵退缩'], longTermGoal: '以战功立身，名垂青史', privateAgenda: '证明降将亦可忠勇无双', speechStyle: { register: '刚毅', rhythm: '利落', habit: '言出必行', metaphor: '矛与盾' }, specialSchemes: ['威震逍遥津', '夜袭敌营'], passiveBonuses: ['守城时防御大幅提高'], weaknesses: ['降将出身受猜忌', '不善朝堂周旋'], recruitmentDifficulty: 80, defectionTriggers: [] },
        { id: 'yueJin', name: '乐进', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '五子良将', title: '右将军', type: '武将', status: 'hidden', rarity: '名将', summary: '乐进以胆烈闻名，每战先登，攻城无数。', stats: { command: 82, strategy: 58, politics: 38, charm: 50, loyalty: 84, ambition: 34 }, personality: { brave: 92, cautious: 30, greedy: 20, loyal: 86, proud: 40, ruthless: 40, idealistic: 38 }, values: ['勇武', '先登之功', '忠诚'], boundaries: ['不畏惧攻城', '不违背军令'], longTermGoal: '以攻城先登之功扬名', privateAgenda: '每次攻城都要争先', speechStyle: { register: '简朴', rhythm: '短促', habit: '少言多做', metaphor: '梯与城' }, specialSchemes: ['先登破城'], passiveBonuses: ['攻城效率提高'], weaknesses: ['过于冒进', '不善谋略'], recruitmentDifficulty: 58, defectionTriggers: [] },
        { id: 'yuJin', name: '于禁', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '五子良将', title: '左将军', type: '武将', status: 'hidden', rarity: '名将', summary: '于禁治军严整，然晚年水淹七军而降关羽，晚节不保。', stats: { command: 80, strategy: 62, politics: 50, charm: 44, loyalty: 60, ambition: 42 }, personality: { brave: 64, cautious: 72, greedy: 30, loyal: 56, proud: 58, ruthless: 44, idealistic: 28 }, values: ['军法', '秩序', '功名'], boundaries: ['治军不可失严', '不愿身死无意义'], longTermGoal: '以严法治军，功成名就', privateAgenda: '维护自己军中威信', speechStyle: { register: '严厉', rhythm: '斩截', habit: '以军法压人', metaphor: '法与令' }, specialSchemes: ['严阵固守'], passiveBonuses: ['整顿军队效果提高'], weaknesses: ['晚节可能不保', '过于看重军法失人心'], recruitmentDifficulty: 55, defectionTriggers: ['兵败被围', '生死存亡之际'] },
        { id: 'xuHuang', name: '徐晃', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '五子良将', title: '右将军', type: '武将', status: 'hidden', rarity: '名将', summary: '徐晃公明，治军有方，樊城之战击退关羽。', stats: { command: 86, strategy: 70, politics: 46, charm: 58, loyalty: 84, ambition: 36 }, personality: { brave: 78, cautious: 68, greedy: 14, loyal: 86, proud: 42, ruthless: 28, idealistic: 44 }, values: ['军令', '公义', '战功'], boundaries: ['不违军令', '不贪财货'], longTermGoal: '以公心立战功', privateAgenda: '做周亚夫式的名将', speechStyle: { register: '严正', rhythm: '沉稳', habit: '以古将自比', metaphor: '阵与法' }, specialSchemes: ['声东击西', '长驱直入'], passiveBonuses: ['反击时攻击力提高'], weaknesses: ['不善政治', '过于刻板'], recruitmentDifficulty: 60, defectionTriggers: [] },
        { id: 'xiahouDun', name: '夏侯惇', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '宗族大将', title: '大将军', type: '武将', status: 'hidden', rarity: '名将', summary: '夏侯惇拔矢啖睛，曹操最为信重的宗族大将。', stats: { command: 78, strategy: 42, politics: 36, charm: 56, loyalty: 96, ambition: 28 }, personality: { brave: 94, cautious: 24, greedy: 16, loyal: 98, proud: 56, ruthless: 48, idealistic: 40 }, values: ['宗族', '忠勇', '义气'], boundaries: ['绝不背叛曹氏', '不惧伤痛'], longTermGoal: '为曹氏守护基业', privateAgenda: '以刚烈证明忠心', speechStyle: { register: '豪迈', rhythm: '直截', habit: '以身作则', metaphor: '血与铁' }, specialSchemes: ['拔矢啖睛', '死战不退'], passiveBonuses: ['受伤后战力不降'], weaknesses: ['常中伏计', '不善谋略'], recruitmentDifficulty: 90, defectionTriggers: [] },
        { id: 'xiahouYuan', name: '夏侯渊', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '宗族猛将', title: '征西将军', type: '武将', status: 'hidden', rarity: '名将', summary: '夏侯渊千里袭敌，以疾速行军闻名，然定军山中伏殒命。', stats: { command: 82, strategy: 56, politics: 32, charm: 52, loyalty: 92, ambition: 38 }, personality: { brave: 90, cautious: 20, greedy: 18, loyal: 94, proud: 54, ruthless: 42, idealistic: 36 }, values: ['速度', '奇袭', '宗族'], boundaries: ['不违军令', '不落后于人'], longTermGoal: '以疾速征伐为曹氏开疆', privateAgenda: '证明三日五百里六日千里的能力', speechStyle: { register: '急促', rhythm: '快速', habit: '催促进军', metaphor: '风与马' }, specialSchemes: ['千里奔袭', '速攻破敌'], passiveBonuses: ['行军速度大幅提高'], weaknesses: ['过于冒进', '防守意识不足'], recruitmentDifficulty: 75, defectionTriggers: [] },
        { id: 'caoRen', name: '曹仁', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '宗族守将', title: '大司马', type: '武将', status: 'hidden', rarity: '名将', summary: '曹仁善守，樊城之围坚守不屈，为曹氏柱石。', stats: { command: 84, strategy: 64, politics: 48, charm: 60, loyalty: 92, ambition: 32 }, personality: { brave: 80, cautious: 62, greedy: 16, loyal: 94, proud: 48, ruthless: 34, idealistic: 38 }, values: ['守御', '宗族', '忠诚'], boundaries: ['不弃城而走', '不违曹操之令'], longTermGoal: '为曹氏守土护疆', privateAgenda: '做最可靠的守城之将', speechStyle: { register: '沉稳', rhythm: '坚定', habit: '以身作则激励士卒', metaphor: '墙与城' }, specialSchemes: ['坚守孤城', '夜袭破围'], passiveBonuses: ['被围城时防御提高'], weaknesses: ['进攻不如防守', '过于依赖城防'], recruitmentDifficulty: 78, defectionTriggers: [] },
        { id: 'caoHong', name: '曹洪', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '宗族将领', title: '骠骑将军', type: '武将', status: 'hidden', rarity: '良才', summary: '曹洪救曹操于危难，然贪财好货，品行有亏。', stats: { command: 68, strategy: 44, politics: 38, charm: 48, loyalty: 80, ambition: 44 }, personality: { brave: 74, cautious: 38, greedy: 68, loyal: 78, proud: 56, ruthless: 36, idealistic: 22 }, values: ['宗族', '财货', '功名'], boundaries: ['不弃曹操于危难', '不愿散财'], longTermGoal: '凭借宗族身份享荣华', privateAgenda: '保全自身并积累财富', speechStyle: { register: '直率', rhythm: '随意', habit: '提旧功邀赏', metaphor: '金与马' }, specialSchemes: ['舍马救主'], passiveBonuses: ['宗族兵力补充速度提高'], weaknesses: ['贪财吝啬', '与朝臣不和'], recruitmentDifficulty: 50, defectionTriggers: [] },
        { id: 'dianWei', name: '典韦', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '虎卫', title: '校尉', type: '武将', status: 'hidden', rarity: '名将', summary: '典韦古之恶来，力大无穷，宛城之战舍命护主。', stats: { command: 58, strategy: 28, politics: 14, charm: 44, loyalty: 98, ambition: 12 }, personality: { brave: 98, cautious: 10, greedy: 8, loyal: 100, proud: 38, ruthless: 52, idealistic: 28 }, values: ['忠诚', '勇力', '保护主公'], boundaries: ['绝不离开主公', '不惧任何敌人'], longTermGoal: '以命护主', privateAgenda: '做主公最坚固的盾', speechStyle: { register: '粗朴', rhythm: '极少言语', habit: '以行动代替言语', metaphor: '铁与血' }, specialSchemes: ['死战护主', '双戟破阵'], passiveBonuses: ['主公遇险时防御暴增'], weaknesses: ['无谋略', '易被算计'], recruitmentDifficulty: 95, defectionTriggers: [] },
        { id: 'xuChu', name: '许褚', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '虎痴', title: '武卫中郎将', type: '武将', status: 'hidden', rarity: '名将', summary: '许褚号虎痴，力大如牛，忠心护主不输典韦。', stats: { command: 54, strategy: 30, politics: 18, charm: 42, loyalty: 96, ambition: 14 }, personality: { brave: 96, cautious: 22, greedy: 12, loyal: 98, proud: 36, ruthless: 46, idealistic: 26 }, values: ['忠诚', '勇力', '主公安危'], boundaries: ['不远离主公', '不惧任何对手'], longTermGoal: '护卫主公安全', privateAgenda: '延续典韦未竟的护卫使命', speechStyle: { register: '粗直', rhythm: '简短', habit: '以行动表达忠心', metaphor: '虎与山' }, specialSchemes: ['裸衣斗马超', '虎卫坚守'], passiveBonuses: ['护卫时主公受伤概率降低'], weaknesses: ['无谋', '不善言辞'], recruitmentDifficulty: 88, defectionTriggers: [] },
        { id: 'liDian', name: '李典', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '儒将', title: '破虏将军', type: '谋士', status: 'hidden', rarity: '良才', summary: '李典好学问，贵儒雅，不与诸将争功。', stats: { command: 72, strategy: 74, politics: 60, charm: 66, loyalty: 80, ambition: 28 }, personality: { brave: 60, cautious: 70, greedy: 12, loyal: 78, proud: 28, ruthless: 18, idealistic: 58 }, values: ['学问', '谦让', '大局'], boundaries: ['不争功', '不冒进'], longTermGoal: '以儒将之风辅助军务', privateAgenda: '用智谋弥补武将的莽撞', speechStyle: { register: '儒雅', rhythm: '从容', habit: '引经据典', metaphor: '书与剑' }, specialSchemes: ['博望之识', '合兵破敌'], passiveBonuses: ['与友军协同时效果提高'], weaknesses: ['不喜争功', '与张辽不和'], recruitmentDifficulty: 48, defectionTriggers: [] },
        { id: 'zangBa', name: '臧霸', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '泰山豪强', title: '镇东将军', type: '武将', status: 'hidden', rarity: '良才', summary: '臧霸据泰山，后归曹操，镇守东方。', stats: { command: 74, strategy: 54, politics: 44, charm: 56, loyalty: 68, ambition: 48 }, personality: { brave: 76, cautious: 44, greedy: 38, loyal: 64, proud: 52, ruthless: 46, idealistic: 30 }, values: ['自立', '地盘', '功名'], boundaries: ['不轻易臣服', '不做无谓牺牲'], longTermGoal: '保泰山根基，在曹操麾下谋发展', privateAgenda: '维持半独立地位', speechStyle: { register: '豪横', rhythm: '直白', habit: '先看利益再决定', metaphor: '山与路' }, specialSchemes: ['泰山据守'], passiveBonuses: ['山地作战能力提高'], weaknesses: ['半独立心态', '忠诚度有限'], recruitmentDifficulty: 62, defectionTriggers: ['利益受损', '被削藩'] },
        { id: 'xunYu', name: '荀彧', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '王佐之才', title: '尚书令', type: '谋士', status: 'hidden', rarity: '传奇', summary: '荀彧王佐之才，为曹操规划大略，然反对加九锡而终。', stats: { command: 44, strategy: 96, politics: 98, charm: 86, loyalty: 72, ambition: 30 }, personality: { brave: 38, cautious: 82, greedy: 6, loyal: 74, proud: 64, ruthless: 22, idealistic: 86 }, values: ['汉室', '礼法', '天下秩序'], boundaries: ['不容篡汉', '不做乱臣'], longTermGoal: '辅佐明主平定天下，恢复汉室秩序', privateAgenda: '阻止曹操走向篡位', speechStyle: { register: '端庄', rhythm: '从容', habit: '以大义进言', metaphor: '鼎与器' }, specialSchemes: ['十胜十败', '驱虎吞狼'], passiveBonuses: ['内政效率大幅提高'], weaknesses: ['忠于汉室而非曹操', '反对篡位终遭忌'], recruitmentDifficulty: 85, defectionTriggers: ['曹操称王'] },
        { id: 'xunYou', name: '荀攸', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '谋主', title: '尚书', type: '谋士', status: 'hidden', rarity: '名将', summary: '荀攸为曹操谋主，十二奇策，深藏不露。', stats: { command: 40, strategy: 92, politics: 82, charm: 72, loyalty: 80, ambition: 26 }, personality: { brave: 36, cautious: 78, greedy: 8, loyal: 82, proud: 42, ruthless: 32, idealistic: 62 }, values: ['智谋', '谦逊', '克己'], boundaries: ['不炫耀功劳', '不冒险行事'], longTermGoal: '以谋略助曹操平天下', privateAgenda: '做最好的幕后谋士', speechStyle: { register: '温厚', rhythm: '平缓', habit: '只说关键一句', metaphor: '暗与明' }, specialSchemes: ['十二奇策', '水淹下邳'], passiveBonuses: ['计策成功率提高'], weaknesses: ['过于内敛', '不善临阵指挥'], recruitmentDifficulty: 72, defectionTriggers: [] },
        { id: 'guoJia', name: '郭嘉', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '鬼才', title: '军师祭酒', type: '谋士', status: 'hidden', rarity: '传奇', summary: '郭嘉鬼才，识人断事如神，惜英年早逝。', stats: { command: 40, strategy: 96, politics: 74, charm: 82, loyalty: 74, ambition: 42 }, personality: { brave: 44, cautious: 36, greedy: 28, loyal: 72, proud: 68, ruthless: 56, idealistic: 40 }, values: ['洞察', '奇谋', '享乐'], boundaries: ['不做无趣之事', '不拘常理'], longTermGoal: '以智谋助曹操统一北方', privateAgenda: '享受推演天下大势的快感', speechStyle: { register: '洒脱', rhythm: '跳跃', habit: '一针见血', metaphor: '棋与局' }, specialSchemes: ['遗计定辽东', '十胜论'], passiveBonuses: ['识破敌军计策概率提高'], weaknesses: ['体弱多病', '生活放浪'], recruitmentDifficulty: 90, defectionTriggers: [] },
        { id: 'chengYu', name: '程昱', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '刚烈谋士', title: '卫尉', type: '谋士', status: 'hidden', rarity: '名将', summary: '程昱性刚烈，守鄄城三城有功，善断大事。', stats: { command: 62, strategy: 88, politics: 72, charm: 48, loyalty: 82, ambition: 40 }, personality: { brave: 72, cautious: 48, greedy: 22, loyal: 84, proud: 68, ruthless: 64, idealistic: 34 }, values: ['果决', '功名', '威权'], boundaries: ['不优柔寡断', '不做妇人之为'], longTermGoal: '以刚毅辅佐曹操成霸业', privateAgenda: '证明谋士亦需铁血', speechStyle: { register: '刚硬', rhythm: '短句', habit: '直言不讳', metaphor: '刀与断' }, specialSchemes: ['三城固守', '毒计绝粮'], passiveBonuses: ['守城时民心不易动摇'], weaknesses: ['性格过于刚烈', '手段狠辣失人心'], recruitmentDifficulty: 65, defectionTriggers: [] },
        { id: 'jiaXu', name: '贾诩', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '毒士', title: '太尉', type: '谋士', status: 'hidden', rarity: '传奇', summary: '贾诩文和，号称毒士，算无遗策，三易其主终得善终。', stats: { command: 46, strategy: 94, politics: 86, charm: 64, loyalty: 52, ambition: 34 }, personality: { brave: 30, cautious: 92, greedy: 24, loyal: 48, proud: 50, ruthless: 78, idealistic: 14 }, values: ['自保', '智谋', '审时度势'], boundaries: ['不涉立嗣之争', '不结交权贵'], longTermGoal: '在乱世中全身而退', privateAgenda: '只求自保，不做多余的表态', speechStyle: { register: '寡言', rhythm: '缓慢', habit: '非不得已不开口', metaphor: '影与水' }, specialSchemes: ['反间计', '劝李傕反长安'], passiveBonuses: ['识破敌方计策概率大幅提高'], weaknesses: ['过于自保', '毒计遭人忌惮'], recruitmentDifficulty: 70, defectionTriggers: ['主公势危', '有更好靠山'] },
        { id: 'liuYe', name: '刘晔', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '宗室谋臣', title: '侍中', type: '谋士', status: 'hidden', rarity: '良才', summary: '刘晔汉宗室，佐曹操多出奇策，发明霹雳车。', stats: { command: 50, strategy: 82, politics: 70, charm: 62, loyalty: 76, ambition: 36 }, personality: { brave: 46, cautious: 64, greedy: 18, loyal: 78, proud: 48, ruthless: 38, idealistic: 44 }, values: ['技术', '奇策', '宗室体面'], boundaries: ['不以宗室身份倨傲', '不提不得体的建议'], longTermGoal: '以技术革新和奇策助曹', privateAgenda: '发明更多攻城器械', speechStyle: { register: '精微', rhythm: '细致', habit: '以技术细节说服人', metaphor: '器与术' }, specialSchemes: ['霹雳车攻城', '预言刘蜀必亡'], passiveBonuses: ['攻城器械效果提高'], weaknesses: ['言多有时不被采纳', '宗室身份敏感'], recruitmentDifficulty: 52, defectionTriggers: [] },
        { id: 'manChong', name: '满宠', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '执法之臣', title: '太尉', type: '政务', status: 'hidden', rarity: '良才', summary: '满宠执法严明，不避权贵，善守城池。', stats: { command: 68, strategy: 72, politics: 78, charm: 42, loyalty: 86, ambition: 30 }, personality: { brave: 62, cautious: 70, greedy: 10, loyal: 88, proud: 46, ruthless: 52, idealistic: 40 }, values: ['法度', '公正', '守御'], boundaries: ['不以私废公', '不畏权贵'], longTermGoal: '以严法治国守疆', privateAgenda: '做曹操最可靠的执法者', speechStyle: { register: '冷峻', rhythm: '简明', habit: '以法理说服', metaphor: '法与尺' }, specialSchemes: ['执法安民', '焚城退敌'], passiveBonuses: ['治安整顿效果提高'], weaknesses: ['执法过严少人情', '不善外交'], recruitmentDifficulty: 48, defectionTriggers: [] },
        { id: 'simaYi', name: '司马懿', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '隐忍谋臣', title: '太傅', type: '谋士', status: 'hidden', rarity: '传奇', summary: '司马懿隐忍深算，鹰视狼顾，终成司马氏基业。', stats: { command: 76, strategy: 96, politics: 94, charm: 62, loyalty: 48, ambition: 92 }, personality: { brave: 44, cautious: 94, greedy: 40, loyal: 38, proud: 72, ruthless: 82, idealistic: 18 }, values: ['权力', '家族', '忍耐'], boundaries: ['不做无把握之事', '不显露真实意图'], longTermGoal: '为司马氏夺取天下奠基', privateAgenda: '等待时机取代曹氏', speechStyle: { register: '深沉', rhythm: '缓慢', habit: '话中有话', metaphor: '渊与冰' }, specialSchemes: ['空营退蜀', '高平陵之变'], passiveBonuses: ['长期对峙时对方先耗尽耐心'], weaknesses: ['多疑', '野心过大'], recruitmentDifficulty: 96, defectionTriggers: ['曹氏衰弱', '掌权时机成熟'] },
        { id: 'chenQun', name: '陈群', faction: 'cao', originFaction: 'cao', possibleFactions: ['cao'], location: 'xuchang', role: '制度之臣', title: '司空', type: '政务', status: 'hidden', rarity: '良才', summary: '陈群创九品中正制，为曹魏定选官之法。', stats: { command: 30, strategy: 72, politics: 90, charm: 68, loyalty: 78, ambition: 42 }, personality: { brave: 24, cautious: 80, greedy: 30, loyal: 76, proud: 56, ruthless: 34, idealistic: 38 }, values: ['制度', '秩序', '门第'], boundaries: ['不破坏等级秩序', '不逾越本分'], longTermGoal: '建立完善的选官制度', privateAgenda: '为士族争取制度性保障', speechStyle: { register: '端方', rhythm: '条理', habit: '引制度论事', metaphor: '尺与度' }, specialSchemes: ['九品中正制', '制礼作乐'], passiveBonuses: ['政务效率提高'], weaknesses: ['过于维护士族利益', '缺乏军事才能'], recruitmentDifficulty: 50, defectionTriggers: [] }
      ],
      yuan: [
        { id: 'juShou', name: '沮授', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '首席谋臣', title: '监军', type: '谋士', status: 'hidden', rarity: '名将', summary: '沮授智谋出众，屡谏袁绍不听，终被俘殉主。', stats: { command: 52, strategy: 90, politics: 82, charm: 58, loyalty: 88, ambition: 28 }, personality: { brave: 50, cautious: 76, greedy: 12, loyal: 90, proud: 46, ruthless: 30, idealistic: 64 }, values: ['忠义', '大局', '谋略'], boundaries: ['不背旧主', '不随波逐流'], longTermGoal: '辅佐袁绍统一河北', privateAgenda: '纠正袁绍的决策失误', speechStyle: { register: '恳切', rhythm: '长句', habit: '反复劝谏', metaphor: '舟与舵' }, specialSchemes: ['缓进耗曹'], passiveBonuses: ['战略规划效果提高'], weaknesses: ['谏言不被采纳', '过于执着忠义'], recruitmentDifficulty: 72, defectionTriggers: [], portraitUrl: './assets/characters/ju-shou.png' },
        { id: 'tianFeng', name: '田丰', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '直谏之臣', title: '别驾', type: '谋士', status: 'hidden', rarity: '名将', summary: '田丰刚直敢谏，因反对南征被下狱，后被袁绍所杀。', stats: { command: 46, strategy: 88, politics: 76, charm: 40, loyalty: 84, ambition: 24 }, personality: { brave: 58, cautious: 72, greedy: 8, loyal: 86, proud: 62, ruthless: 22, idealistic: 72 }, values: ['直谏', '大义', '正确决策'], boundaries: ['不阿谀奉承', '不畏惧获罪'], longTermGoal: '阻止袁绍犯致命错误', privateAgenda: '以死谏证明忠心', speechStyle: { register: '激烈', rhythm: '紧迫', habit: '言辞尖锐不留情', metaphor: '霜与剑' }, specialSchemes: ['急攻许都'], passiveBonuses: ['谏言被采纳时效果加倍'], weaknesses: ['过于刚直', '不谙人情世故'], recruitmentDifficulty: 68, defectionTriggers: [], portraitUrl: './assets/characters/tian-feng.png' },
        { id: 'xuYou', name: '许攸', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan', 'cao'], location: 'yecheng', role: '贪功谋士', title: '谋士', type: '谋士', status: 'hidden', rarity: '良才', summary: '许攸因家属犯罪而投曹操，献计火烧乌巢。', stats: { command: 38, strategy: 78, politics: 56, charm: 48, loyalty: 36, ambition: 62 }, personality: { brave: 34, cautious: 32, greedy: 72, loyal: 32, proud: 76, ruthless: 48, idealistic: 18 }, values: ['功名', '利益', '报复'], boundaries: ['不受屈辱', '不放过获利机会'], longTermGoal: '以谋略获取最大功名', privateAgenda: '谁给我更多就投谁', speechStyle: { register: '刻薄', rhythm: '急切', habit: '居功自傲', metaphor: '火与粮' }, specialSchemes: ['火烧乌巢'], passiveBonuses: ['截获敌方粮草时效果提高'], weaknesses: ['贪功傲慢', '忠诚度极低'], recruitmentDifficulty: 40, defectionTriggers: ['家属犯罪被抓', '不被重用', '受到屈辱'], portraitUrl: './assets/characters/xu-you.png' },
        { id: 'shenPei', name: '审配', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '忠烈之臣', title: '治中', type: '政务', status: 'hidden', rarity: '良才', summary: '审配坚守邺城，城破殉主，忠烈可嘉。', stats: { command: 60, strategy: 68, politics: 78, charm: 38, loyalty: 92, ambition: 30 }, personality: { brave: 72, cautious: 60, greedy: 14, loyal: 94, proud: 58, ruthless: 52, idealistic: 50 }, values: ['忠诚', '坚守', '法度'], boundaries: ['不投降', '不背袁氏'], longTermGoal: '死守邺城保全袁氏基业', privateAgenda: '以死殉主证明忠节', speechStyle: { register: '严厉', rhythm: '坚定', habit: '以法纪约束众人', metaphor: '城与义' }, specialSchemes: ['坚守邺城'], passiveBonuses: ['守城时士卒不溃散'], weaknesses: ['过于固执', '不善变通'], recruitmentDifficulty: 65, defectionTriggers: [], portraitUrl: './assets/characters/shen-pei.png' },
        { id: 'guoTu', name: '郭图', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '党争谋士', title: '军师', type: '谋士', status: 'hidden', rarity: '良才', summary: '郭图党同伐异，屡进谗言，为袁绍集团内耗推手。', stats: { command: 36, strategy: 66, politics: 64, charm: 52, loyalty: 42, ambition: 68 }, personality: { brave: 28, cautious: 40, greedy: 58, loyal: 40, proud: 64, ruthless: 62, idealistic: 14 }, values: ['权位', '党争', '私利'], boundaries: ['不放过打击对手机会', '不做不利己之事'], longTermGoal: '在袁绍集团中争得最大话语权', privateAgenda: '打压异己，巩固自身地位', speechStyle: { register: '阴柔', rhythm: '迂回', habit: '进谗不露痕迹', metaphor: '暗与影' }, specialSchemes: ['谗言害人', '党争夺权'], passiveBonuses: ['党争中胜率提高'], weaknesses: ['不顾大局', '军略有限'], recruitmentDifficulty: 35, defectionTriggers: ['主公势败', '有更好靠山'], portraitUrl: './assets/characters/guo-tu.png' },
        { id: 'fengJi', name: '逢纪', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '阴谋之士', title: '谋士', type: '谋士', status: 'hidden', rarity: '良才', summary: '逢纪善阴谋，矫诏立袁尚，加剧袁氏内斗。', stats: { command: 34, strategy: 72, politics: 66, charm: 38, loyalty: 50, ambition: 64 }, personality: { brave: 30, cautious: 48, greedy: 52, loyal: 48, proud: 58, ruthless: 72, idealistic: 12 }, values: ['阴谋', '权力', '私利'], boundaries: ['不做无利益之事', '不忠于已败之主'], longTermGoal: '在袁氏内斗中获利', privateAgenda: '操控继承人之争谋利', speechStyle: { register: '阴沉', rhythm: '低语', habit: '暗中进言', metaphor: '刀与背' }, specialSchemes: ['矫诏立嗣', '暗害异己'], passiveBonuses: ['密谋成功率提高'], weaknesses: ['不得人心', '过于阴险'], recruitmentDifficulty: 38, defectionTriggers: ['主公势败'], portraitUrl: './assets/characters/feng-ji.png' },
        { id: 'yanLiang', name: '颜良', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '河北上将', title: '将军', type: '武将', status: 'hidden', rarity: '名将', summary: '颜良勇冠三军，为袁绍麾下头号猛将。', stats: { command: 82, strategy: 42, politics: 24, charm: 48, loyalty: 78, ambition: 44 }, personality: { brave: 92, cautious: 18, greedy: 34, loyal: 76, proud: 72, ruthless: 52, idealistic: 28 }, values: ['勇武', '战功', '颜面'], boundaries: ['不畏惧任何对手', '不退缩'], longTermGoal: '以武勇扬名河北', privateAgenda: '证明自己天下无双', speechStyle: { register: '傲慢', rhythm: '短促', habit: '轻视对手', metaphor: '矛与力' }, specialSchemes: ['河北冲锋', '先阵突杀'], passiveBonuses: ['首战攻击力大幅提高'], weaknesses: ['过于轻敌', '不防暗算'], recruitmentDifficulty: 62, defectionTriggers: [], portraitUrl: './assets/characters/yan-liang.png' },
        { id: 'wenChou', name: '文丑', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan'], location: 'yecheng', role: '河北名将', title: '将军', type: '武将', status: 'hidden', rarity: '名将', summary: '文丑与颜良齐名，并称袁绍双璧。', stats: { command: 80, strategy: 38, politics: 22, charm: 44, loyalty: 76, ambition: 42 }, personality: { brave: 90, cautious: 16, greedy: 36, loyal: 74, proud: 68, ruthless: 50, idealistic: 26 }, values: ['勇武', '义气', '战功'], boundaries: ['不弃战友', '不避强敌'], longTermGoal: '与颜良并肩征战天下', privateAgenda: '为颜良之死复仇', speechStyle: { register: '粗猛', rhythm: '急切', habit: '怒吼冲锋', metaphor: '铁与风' }, specialSchemes: ['追击破敌', '河北骑突'], passiveBonuses: ['骑兵冲锋效果提高'], weaknesses: ['冲动易怒', '不善谋略'], recruitmentDifficulty: 60, defectionTriggers: [], portraitUrl: './assets/characters/wen-chou.png' },
        { id: 'zhangHe', name: '张郃', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan', 'cao'], location: 'yecheng', role: '河北名将', title: '将军', type: '武将', status: 'hidden', rarity: '名将', summary: '张郃以巧变闻名，官渡后归曹操，为五子良将之一。', stats: { command: 86, strategy: 72, politics: 44, charm: 56, loyalty: 58, ambition: 46 }, personality: { brave: 72, cautious: 68, greedy: 28, loyal: 56, proud: 48, ruthless: 38, idealistic: 36 }, values: ['巧变', '生存', '功名'], boundaries: ['不做无意义的牺牲', '不拘泥于一种战术'], longTermGoal: '在乱世中以巧变立身', privateAgenda: '找到真正值得效力的明主', speechStyle: { register: '务实', rhythm: '灵活', habit: '因地制宜', metaphor: '水与势' }, specialSchemes: ['巧变设伏', '山地游击'], passiveBonuses: ['地形适应力提高'], weaknesses: ['忠诚度随局势摇摆', '过于审时度势'], recruitmentDifficulty: 58, defectionTriggers: ['袁绍猜忌', '官渡压力', '曹操招降'], portraitUrl: './assets/characters/zhang-he.png' },
        { id: 'gaoLan', name: '高览', faction: 'yuan', originFaction: 'yuan', possibleFactions: ['yuan', 'cao'], location: 'yecheng', role: '河北将领', title: '将军', type: '武将', status: 'hidden', rarity: '良才', summary: '高览与张郃齐名，官渡后同降曹操。', stats: { command: 74, strategy: 54, politics: 36, charm: 48, loyalty: 56, ambition: 38 }, personality: { brave: 70, cautious: 52, greedy: 24, loyal: 54, proud: 42, ruthless: 34, idealistic: 30 }, values: ['功名', '生存', '战友'], boundaries: ['不盲从错误命令', '不做无谓牺牲'], longTermGoal: '在乱世中找到出路', privateAgenda: '随张郃寻找更好的归宿', speechStyle: { register: '沉稳', rhythm: '平实', habit: '不多说话', metaphor: '盾与守' }, specialSchemes: ['阵地防御'], passiveBonuses: ['防御阵型效果提高'], weaknesses: ['随波逐流', '缺乏主见'], recruitmentDifficulty: 42, defectionTriggers: ['主公势败', '同僚投降'], portraitUrl: './assets/characters/gao-lan.png' }
      ],
      sun: [
        { id: 'sunCe', name: '孙策', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '小霸王', title: '讨逆将军', type: '武将', status: 'hidden', rarity: '传奇', summary: '孙策小霸王，以猛锐平定江东，英年早逝。', stats: { command: 94, strategy: 68, politics: 52, charm: 86, loyalty: 88, ambition: 74 }, personality: { brave: 98, cautious: 28, greedy: 24, loyal: 86, proud: 78, ruthless: 52, idealistic: 58 }, values: ['武勇', '江东基业', '父亲遗志'], boundaries: ['不辱孙氏之名', '不惧任何对手'], longTermGoal: '继承父志，平定江东', privateAgenda: '以武力证明孙氏不可辱', speechStyle: { register: '豪爽', rhythm: '快捷', habit: '先战再说', metaphor: '枪与风' }, specialSchemes: ['横扫江东', '太史慈单挑'], passiveBonuses: ['进攻时攻击力大幅提高'], weaknesses: ['好杀降', '轻信易中计'], recruitmentDifficulty: 92, defectionTriggers: [] },
        { id: 'sunJian', name: '孙坚', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '江东猛虎', title: '破虏将军', type: '武将', status: 'hidden', rarity: '传奇', summary: '孙坚江东猛虎，讨董先锋，得传国玉玺，殒命襄阳。', stats: { command: 92, strategy: 64, politics: 50, charm: 78, loyalty: 82, ambition: 68 }, personality: { brave: 98, cautious: 24, greedy: 38, loyal: 80, proud: 72, ruthless: 56, idealistic: 54 }, values: ['勇武', '忠汉', '江东'], boundaries: ['不背汉室名义', '不惧强敌'], longTermGoal: '以勇武为孙氏立基', privateAgenda: '得玉玺后暗中筹划大业', speechStyle: { register: '勇决', rhythm: '利落', habit: '以行动说话', metaphor: '虎与山' }, specialSchemes: ['破董先锋', '跨江击刘表'], passiveBonuses: ['先手攻击时伤害提高'], weaknesses: ['过于冒进', '对玉玺执念深'], recruitmentDifficulty: 95, defectionTriggers: [] },
        { id: 'zhouYu', name: '周瑜', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '美周郎', title: '大都督', type: '谋士', status: 'hidden', rarity: '传奇', summary: '周瑜文武双全，赤壁之战名垂千古。', stats: { command: 88, strategy: 94, politics: 78, charm: 90, loyalty: 84, ambition: 46 }, personality: { brave: 74, cautious: 58, greedy: 14, loyal: 84, proud: 72, ruthless: 40, idealistic: 56 }, values: ['才华', '江东', '知己'], boundaries: ['不辱孙氏之托', '不容他人轻视'], longTermGoal: '为孙氏守江东并图天下', privateAgenda: '在天下人面前证明才华', speechStyle: { register: '风雅', rhythm: '从容', habit: '抚琴论兵', metaphor: '琴与火' }, specialSchemes: ['赤壁火攻', '苦肉计', '群英会'], passiveBonuses: ['水战指挥效果大幅提高'], weaknesses: ['心胸有隙', '英年早逝'], recruitmentDifficulty: 90, defectionTriggers: [] },
        { id: 'luSu', name: '鲁肃', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '长者谋臣', title: '赞军校尉', type: '谋士', status: 'hidden', rarity: '名将', summary: '鲁肃忠厚长者，促成孙刘联盟，榻上策定三分。', stats: { command: 56, strategy: 88, politics: 84, charm: 82, loyalty: 82, ambition: 28 }, personality: { brave: 48, cautious: 66, greedy: 10, loyal: 84, proud: 36, ruthless: 16, idealistic: 74 }, values: ['联盟', '大局', '和平'], boundaries: ['不让孙刘开战', '不做背信之事'], longTermGoal: '维持孙刘联盟抗曹', privateAgenda: '以双方共存换取天下太平', speechStyle: { register: '厚道', rhythm: '和缓', habit: '先夸对方再讲道理', metaphor: '桥与水' }, specialSchemes: ['榻上策', '单刀赴会'], passiveBonuses: ['外交联盟成功率大幅提高'], weaknesses: ['过于信任刘备', '外交手腕偏软'], recruitmentDifficulty: 68, defectionTriggers: [] },
        { id: 'luMeng', name: '吕蒙', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '白衣渡江', title: '大都督', type: '武将', status: 'hidden', rarity: '名将', summary: '吕蒙从武夫到儒将，白衣渡江取荆州。', stats: { command: 84, strategy: 82, politics: 64, charm: 56, loyalty: 80, ambition: 46 }, personality: { brave: 78, cautious: 64, greedy: 30, loyal: 82, proud: 52, ruthless: 50, idealistic: 36 }, values: ['学习', '功名', '进取'], boundaries: ['不让轻视成为现实', '不做莽夫'], longTermGoal: '从武夫蜕变为智将', privateAgenda: '用学识证明自己非只莽夫', speechStyle: { register: '沉稳', rhythm: '由粗转细', habit: '以实例论战', metaphor: '书与刀' }, specialSchemes: ['白衣渡江', '士别三日'], passiveBonuses: ['偷袭成功率大幅提高'], weaknesses: ['曾因粗鲁误事', '与关羽关系恶化'], recruitmentDifficulty: 65, defectionTriggers: [] },
        { id: 'luXun', name: '陆逊', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '书生拜将', title: '大都督', type: '谋士', status: 'hidden', rarity: '名将', summary: '陆逊书生拜将，夷陵之战火烧连营七百里。', stats: { command: 82, strategy: 92, politics: 76, charm: 70, loyalty: 82, ambition: 38 }, personality: { brave: 56, cautious: 80, greedy: 10, loyal: 84, proud: 48, ruthless: 46, idealistic: 48 }, values: ['耐心', '计谋', '江东'], boundaries: ['不急于求战', '不轻敌冒进'], longTermGoal: '守护江东基业', privateAgenda: '以耐心和智慧取胜', speechStyle: { register: '儒雅', rhythm: '沉稳', habit: '谦逊中藏锋芒', metaphor: '火与林' }, specialSchemes: ['火烧连营', '骄兵之计'], passiveBonuses: ['被攻击时防御随回合提高'], weaknesses: ['年少资浅被轻视', '朝中受排挤'], recruitmentDifficulty: 72, defectionTriggers: [] },
        { id: 'taishiCi', name: '太史慈', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '神箭手', title: '建昌都尉', type: '武将', status: 'hidden', rarity: '名将', summary: '太史慈信义笃烈，猿臂善射，与孙策惺惺相惜。', stats: { command: 84, strategy: 54, politics: 38, charm: 68, loyalty: 84, ambition: 36 }, personality: { brave: 92, cautious: 44, greedy: 16, loyal: 86, proud: 56, ruthless: 34, idealistic: 58 }, values: ['信义', '武勇', '知遇之恩'], boundaries: ['不负承诺', '不背信义'], longTermGoal: '以武勇报知遇之恩', privateAgenda: '在天下人面前证明信义之重', speechStyle: { register: '刚烈', rhythm: '利落', habit: '言出必行', metaphor: '箭与义' }, specialSchemes: ['北海突围', '神箭退敌'], passiveBonuses: ['弓兵攻击力提高'], weaknesses: ['过于重信', '不善谋略'], recruitmentDifficulty: 68, defectionTriggers: [] },
        { id: 'ganNing', name: '甘宁', faction: 'sun', originFaction: 'liubiao', possibleFactions: ['liubiao', 'sun'], location: 'jianye', role: '锦帆贼', title: '折冲将军', type: '武将', status: 'hidden', rarity: '名将', summary: '甘宁原为荆州水贼，后投东吴，百骑劫曹营。', stats: { command: 82, strategy: 60, politics: 34, charm: 62, loyalty: 68, ambition: 54 }, personality: { brave: 94, cautious: 28, greedy: 52, loyal: 66, proud: 68, ruthless: 56, idealistic: 30 }, values: ['勇武', '自由', '功名'], boundaries: ['不受轻视', '不做无趣之事'], longTermGoal: '以勇武在乱世扬名', privateAgenda: '证明锦帆贼也能成大事', speechStyle: { register: '粗豪', rhythm: '直爽', habit: '以行动说话', metaphor: '帆与浪' }, specialSchemes: ['百骑劫营', '夜袭破敌'], passiveBonuses: ['夜袭成功率大幅提高'], weaknesses: ['出身低微受轻视', '性情暴烈'], recruitmentDifficulty: 55, defectionTriggers: ['不受重用', '被轻视'] },
        { id: 'huangGai', name: '黄盖', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '三世老臣', title: '武锋校尉', type: '武将', status: 'hidden', rarity: '良才', summary: '黄盖历仕三代，赤壁之战苦肉计舍身诈降。', stats: { command: 76, strategy: 56, politics: 52, charm: 60, loyalty: 90, ambition: 22 }, personality: { brave: 86, cautious: 48, greedy: 10, loyal: 92, proud: 40, ruthless: 34, idealistic: 52 }, values: ['忠诚', '苦战', '孙氏基业'], boundaries: ['不背孙氏', '不惧皮肉之苦'], longTermGoal: '为孙氏守江东', privateAgenda: '以老将之身完成最后的壮举', speechStyle: { register: '老辣', rhythm: '沉稳', habit: '以身作则', metaphor: '火与铁' }, specialSchemes: ['苦肉计', '火船突阵'], passiveBonuses: ['诈降成功率提高'], weaknesses: ['年事已高', '过于刚直'], recruitmentDifficulty: 42, defectionTriggers: [] },
        { id: 'chengPu', name: '程普', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '三世老将', title: '荡寇将军', type: '武将', status: 'hidden', rarity: '良才', summary: '程普历仕三代，德高望重，为江东众将之首。', stats: { command: 78, strategy: 60, politics: 58, charm: 68, loyalty: 90, ambition: 20 }, personality: { brave: 76, cautious: 56, greedy: 8, loyal: 92, proud: 48, ruthless: 30, idealistic: 50 }, values: ['忠义', '资历', '孙氏基业'], boundaries: ['不轻视后辈', '不背孙氏'], longTermGoal: '以老将之身辅佐孙氏', privateAgenda: '维护老将的尊严和话语权', speechStyle: { register: '沉稳', rhythm: '从容', habit: '以资历说话', metaphor: '根与树' }, specialSchemes: ['老将压阵'], passiveBonuses: ['友军士气不易下降'], weaknesses: ['年迈力衰', '资历思想重'], recruitmentDifficulty: 38, defectionTriggers: [] },
        { id: 'hanDang', name: '韩当', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '三世将领', title: '昭武将军', type: '武将', status: 'hidden', rarity: '良才', summary: '韩当历仕三代，弓马娴熟，忠诚可靠。', stats: { command: 72, strategy: 48, politics: 40, charm: 52, loyalty: 86, ambition: 22 }, personality: { brave: 74, cautious: 52, greedy: 14, loyal: 88, proud: 36, ruthless: 28, idealistic: 42 }, values: ['忠诚', '弓马', '本分'], boundaries: ['不逾本分', '不背孙氏'], longTermGoal: '以弓马技艺为孙氏效力', privateAgenda: '做好本职不争功', speechStyle: { register: '朴实', rhythm: '平直', habit: '少言多做', metaphor: '弓与马' }, specialSchemes: ['骑射游击'], passiveBonuses: ['弓骑兵效果提高'], weaknesses: ['能力中庸', '不善独立领兵'], recruitmentDifficulty: 34, defectionTriggers: [] },
        { id: 'zhouTai', name: '周泰', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '忠勇护卫', title: '陵阳侯', type: '武将', status: 'hidden', rarity: '良才', summary: '周泰数次舍命救孙权，遍体鳞伤而不退。', stats: { command: 70, strategy: 38, politics: 24, charm: 50, loyalty: 98, ambition: 14 }, personality: { brave: 96, cautious: 20, greedy: 8, loyal: 100, proud: 28, ruthless: 42, idealistic: 38 }, values: ['忠诚', '护卫', '不退'], boundaries: ['绝不弃主', '不惧任何危险'], longTermGoal: '以命守护孙权安全', privateAgenda: '只要主公安全便心满意足', speechStyle: { register: '沉默', rhythm: '极少言语', habit: '以行动表达', metaphor: '伤与盾' }, specialSchemes: ['舍命护主', '死战不退'], passiveBonuses: ['主公遇险时防御暴增'], weaknesses: ['无谋略', '不善指挥'], recruitmentDifficulty: 52, defectionTriggers: [] },
        { id: 'lingTong', name: '凌统', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '少壮将领', title: '偏将军', type: '武将', status: 'hidden', rarity: '良才', summary: '凌统少壮勇烈，与甘宁有杀父之仇后和解。', stats: { command: 74, strategy: 50, politics: 36, charm: 58, loyalty: 78, ambition: 40 }, personality: { brave: 84, cautious: 36, greedy: 18, loyal: 80, proud: 62, ruthless: 42, idealistic: 44 }, values: ['勇武', '报仇', '义气'], boundaries: ['不背父仇', '不惧强敌'], longTermGoal: '为父报仇后以武勇立身', privateAgenda: '与甘宁竞争并超越他', speechStyle: { register: '刚烈', rhythm: '急切', habit: '年轻气盛', metaphor: '刃与血' }, specialSchemes: ['少壮突阵'], passiveBonuses: ['与敌将单挑时攻击力提高'], weaknesses: ['年轻冲动', '与甘宁不睦'], recruitmentDifficulty: 45, defectionTriggers: [] },
        { id: 'zhangZhao', name: '张昭', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '内政之臣', title: '长史', type: '政务', status: 'hidden', rarity: '名将', summary: '张昭内政之才，孙策托孤之臣，然赤壁主降。', stats: { command: 28, strategy: 72, politics: 90, charm: 64, loyalty: 78, ambition: 30 }, personality: { brave: 22, cautious: 84, greedy: 16, loyal: 80, proud: 74, ruthless: 28, idealistic: 40 }, values: ['秩序', '稳健', '士大夫体面'], boundaries: ['不赞同冒险', '不丢士大夫脸面'], longTermGoal: '维持江东内部稳定', privateAgenda: '以内政才能守住基业', speechStyle: { register: '严正', rhythm: '训诫式', habit: '引经据典教训人', metaphor: '墙与基' }, specialSchemes: ['安定后方'], passiveBonuses: ['内政效率大幅提高'], weaknesses: ['过于保守', '赤壁主降失声望'], recruitmentDifficulty: 55, defectionTriggers: [] },
        { id: 'zhangHong', name: '张纮', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '文士谋臣', title: '长史', type: '谋士', status: 'hidden', rarity: '良才', summary: '张纮与张昭并称二张，善文章，识大局。', stats: { command: 26, strategy: 76, politics: 82, charm: 68, loyalty: 80, ambition: 26 }, personality: { brave: 24, cautious: 72, greedy: 12, loyal: 82, proud: 46, ruthless: 18, idealistic: 54 }, values: ['文采', '大局', '稳健'], boundaries: ['不做越界之事', '不写违心之文'], longTermGoal: '以文才辅佐孙氏', privateAgenda: '为孙氏撰写讨伐檄文和治国方略', speechStyle: { register: '文雅', rhythm: '工整', habit: '以文章论事', metaphor: '笔与墨' }, specialSchemes: ['檄文安民', '战略建议'], passiveBonuses: ['文官管理效果提高'], weaknesses: ['不善军事', '过于温和'], recruitmentDifficulty: 40, defectionTriggers: [] },
        { id: 'buZhi', name: '步骘', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '沉稳文臣', title: '骠骑将军', type: '政务', status: 'hidden', rarity: '良才', summary: '步骘沉稳有度，镇守西陵，治理有方。', stats: { command: 58, strategy: 70, politics: 80, charm: 62, loyalty: 80, ambition: 32 }, personality: { brave: 42, cautious: 74, greedy: 14, loyal: 82, proud: 38, ruthless: 26, idealistic: 48 }, values: ['治理', '安定', '本分'], boundaries: ['不冒进', '不越权'], longTermGoal: '为孙氏守好边疆', privateAgenda: '以治理才能证明价值', speechStyle: { register: '沉稳', rhythm: '平实', habit: '以理服人', metaphor: '墙与路' }, specialSchemes: ['镇守西陵'], passiveBonuses: ['边境城市治安提高'], weaknesses: ['缺乏进攻性', '过于保守'], recruitmentDifficulty: 38, defectionTriggers: [] },
        { id: 'zhuGeJin', name: '诸葛瑾', faction: 'sun', originFaction: 'sun', possibleFactions: ['sun'], location: 'jianye', role: '外交之臣', title: '大将军', type: '政务', status: 'hidden', rarity: '良才', summary: '诸葛瑾诸葛亮之兄，为东吴出使蜀汉，善调和。', stats: { command: 42, strategy: 68, politics: 78, charm: 76, loyalty: 82, ambition: 26 }, personality: { brave: 34, cautious: 72, greedy: 10, loyal: 84, proud: 36, ruthless: 16, idealistic: 56 }, values: ['兄弟情', '外交', '和平'], boundaries: ['不因公废私', '不背孙氏'], longTermGoal: '维持孙刘联盟', privateAgenda: '在兄弟与主公之间找平衡', speechStyle: { register: '温厚', rhythm: '和缓', habit: '以亲情打动人', metaphor: '桥与亲' }, specialSchemes: ['出使修好', '兄弟外交'], passiveBonuses: ['与蜀汉交涉成功率提高'], weaknesses: ['才能不如其弟', '过于温和'], recruitmentDifficulty: 42, defectionTriggers: [] }
      ],
      liubiao: [
        { id: 'kuaiLiang', name: '蒯良', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao'], location: 'xiangyang', role: '荆州谋臣', title: '谋士', type: '谋士', status: 'hidden', rarity: '良才', summary: '蒯良与蒯越兄弟，为刘表定荆州之策。', stats: { command: 38, strategy: 78, politics: 80, charm: 66, loyalty: 70, ambition: 38 }, personality: { brave: 32, cautious: 72, greedy: 26, loyal: 70, proud: 52, ruthless: 30, idealistic: 48 }, values: ['荆州', '士族', '安定'], boundaries: ['不容荆州大乱', '不轻言战争'], longTermGoal: '维护荆州士族利益', privateAgenda: '保持蒯氏在荆州的影响力', speechStyle: { register: '从容', rhythm: '沉稳', habit: '以形势分析进言', metaphor: '棋与势' }, specialSchemes: ['定荆之策'], passiveBonuses: ['士族支持度提高'], weaknesses: ['过于保守', '与蒯越意见不合'], recruitmentDifficulty: 48, defectionTriggers: [] },
        { id: 'yiJi', name: '伊籍', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'xiangyang', role: '外交幕僚', title: '从事', type: '政务', status: 'rumored', rarity: '良才', summary: '伊籍与刘备交好，后随刘备入蜀。', stats: { command: 30, strategy: 58, politics: 70, charm: 74, loyalty: 64, ambition: 28 }, personality: { brave: 34, cautious: 56, greedy: 12, loyal: 66, proud: 30, ruthless: 14, idealistic: 56 }, values: ['仁义', '识人', '忠主'], boundaries: ['不事暴虐之主', '不违背良心'], longTermGoal: '追随值得辅佐的明主', privateAgenda: '暗中亲近刘备观察其是否值得投奔', speechStyle: { register: '谦和', rhythm: '平缓', habit: '低调表态', metaphor: '风与草' }, specialSchemes: ['暗中通好'], passiveBonuses: ['外交好感度提高'], weaknesses: ['立场摇摆', '军事能力不足'], recruitmentDifficulty: 38, defectionTriggers: ['刘表去世', '刘备入荆'] },
        { id: 'maLiang', name: '马良', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'xiangyang', role: '白眉最良', title: '侍中', type: '谋士', status: 'rumored', rarity: '名将', summary: '马良白眉，兄弟五人中最贤，善外交谋略。', stats: { command: 48, strategy: 82, politics: 78, charm: 76, loyalty: 74, ambition: 34 }, personality: { brave: 40, cautious: 68, greedy: 10, loyal: 76, proud: 38, ruthless: 18, idealistic: 66 }, values: ['贤才', '谋略', '忠义'], boundaries: ['不做不义之事', '不违背道义'], longTermGoal: '辅佐明主治理天下', privateAgenda: '以才能在荆州和蜀汉间找到出路', speechStyle: { register: '儒雅', rhythm: '清晰', habit: '以理服人', metaphor: '眉与识' }, specialSchemes: ['白眉献策', '外交斡旋'], passiveBonuses: ['谋略成功率提高'], weaknesses: ['过于理想化', '不善军事指挥'], recruitmentDifficulty: 55, defectionTriggers: ['刘备入荆'] },
        { id: 'maSu', name: '马谡', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'xiangyang', role: '纸上谈兵', title: '参军', type: '谋士', status: 'rumored', rarity: '良才', summary: '马谡才器过人，然言过其实，街亭之失为千古教训。', stats: { command: 42, strategy: 72, politics: 60, charm: 64, loyalty: 66, ambition: 52 }, personality: { brave: 38, cautious: 36, greedy: 20, loyal: 68, proud: 78, ruthless: 28, idealistic: 52 }, values: ['理论', '功名', '被认可'], boundaries: ['不承认自己错了', '不服从认为不如己者'], longTermGoal: '以谋略证明自己非纸上谈兵', privateAgenda: '急于获得独当一面的机会', speechStyle: { register: '自信', rhythm: '流畅', habit: '好谈兵法大略', metaphor: '书与战' }, specialSchemes: ['攻心为上'], passiveBonuses: ['理论谋略效果提高'], weaknesses: ['言过其实', '不听劝阻', '缺乏实战经验'], recruitmentDifficulty: 40, defectionTriggers: ['刘备入荆'] },
        { id: 'huangZhong', name: '黄忠', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'changsha', role: '老将', title: '后将军', type: '武将', status: 'rumored', rarity: '传奇', summary: '黄忠老当益壮，定军山斩夏侯渊，勇冠三军。', stats: { command: 88, strategy: 52, politics: 30, charm: 64, loyalty: 78, ambition: 32 }, personality: { brave: 90, cautious: 48, greedy: 12, loyal: 80, proud: 56, ruthless: 36, idealistic: 44 }, values: ['武勇', '忠义', '不服老'], boundaries: ['不被年龄定义', '不临阵退缩'], longTermGoal: '以老将之身再立大功', privateAgenda: '证明老将仍有万夫不当之勇', speechStyle: { register: '豪迈', rhythm: '沉稳', habit: '不服老', metaphor: '弓与铁' }, specialSchemes: ['定军山斩将', '百步穿杨'], passiveBonuses: ['远距离攻击力提高'], weaknesses: ['年事已高', '易被激将'], recruitmentDifficulty: 62, defectionTriggers: ['荆南动荡', '刘备入荆', '长沙易主'] },
        { id: 'weiYan', name: '魏延', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'changsha', role: '勇悍之将', title: '镇北将军', type: '武将', status: 'rumored', rarity: '名将', summary: '魏延勇猛过人，然性情孤傲，不被信任。', stats: { command: 84, strategy: 62, politics: 34, charm: 40, loyalty: 52, ambition: 68 }, personality: { brave: 88, cautious: 32, greedy: 32, loyal: 50, proud: 82, ruthless: 54, idealistic: 30 }, values: ['功名', '才能', '被认可'], boundaries: ['不忍受轻视', '不服从庸才'], longTermGoal: '以奇谋和勇武建立不世之功', privateAgenda: '证明子午谷奇谋的正确性', speechStyle: { register: '傲慢', rhythm: '急切', habit: '常提自己的策略', metaphor: '险与功' }, specialSchemes: ['子午谷奇谋', '勇夺城门'], passiveBonuses: ['进攻时攻击力提高'], weaknesses: ['与同僚不和', '不被信任', '过于自负'], recruitmentDifficulty: 58, defectionTriggers: ['不受重用', '被猜忌'] },
        { id: 'liuQi', name: '刘琦', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'liu'], location: 'xiangyang', role: '刘表长子', title: '江夏太守', type: '政务', status: 'hidden', rarity: '良才', summary: '刘琦为刘表长子，受蔡氏排挤，求计诸葛亮出镇江夏。', stats: { command: 42, strategy: 44, politics: 54, charm: 62, loyalty: 70, ambition: 20 }, personality: { brave: 38, cautious: 62, greedy: 8, loyal: 72, proud: 30, ruthless: 10, idealistic: 56 }, values: ['自保', '孝道', '仁厚'], boundaries: ['不与弟争权', '不害人'], longTermGoal: '在蔡氏排挤下保全自身', privateAgenda: '寻求外部力量支持以自保', speechStyle: { register: '谦弱', rhythm: '犹豫', habit: '请人出主意', metaphor: '叶与风' }, specialSchemes: ['求计出镇江夏'], passiveBonuses: ['与刘备势力好感度提高'], weaknesses: ['性格软弱', '缺乏主见'], recruitmentDifficulty: 30, defectionTriggers: ['刘表去世'] },
        { id: 'liuCong', name: '刘琮', faction: 'liubiao', originFaction: 'liubiao', possibleFactions: ['liubiao', 'cao'], location: 'xiangyang', role: '刘表次子', title: '荆州牧', type: '政务', status: 'hidden', rarity: '良才', summary: '刘琮受蔡氏拥立，降曹操，失荆州。', stats: { command: 22, strategy: 30, politics: 42, charm: 44, loyalty: 40, ambition: 18 }, personality: { brave: 16, cautious: 68, greedy: 24, loyal: 38, proud: 24, ruthless: 12, idealistic: 22 }, values: ['安逸', '听从母族', '自保'], boundaries: ['不做冒险之事', '听从蔡氏安排'], longTermGoal: '保住自身和蔡氏地位', privateAgenda: '只想安安稳稳不做争斗', speechStyle: { register: '怯弱', rhythm: '犹豫', habit: '凡事请示蔡氏', metaphor: '雀与笼' }, specialSchemes: ['献州降曹'], passiveBonuses: ['降伏时保留部分资源'], weaknesses: ['懦弱无能', '完全受蔡氏操控'], recruitmentDifficulty: 20, defectionTriggers: ['曹操南征', '蔡氏劝降'] }
      ],
      liuzhang: [
        { id: 'liuZhang', name: '刘璋', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang'], location: '', offMapLocation: 'chengdu', role: '益州牧', title: '益州牧', type: '政务', status: 'hidden', rarity: '名将', summary: '刘璋暗弱，守益州而不能用，终为刘备所取。', stats: { command: 32, strategy: 38, politics: 54, charm: 56, loyalty: 56, ambition: 16 }, personality: { brave: 18, cautious: 72, greedy: 22, loyal: 56, proud: 28, ruthless: 8, idealistic: 40 }, values: ['安逸', '守成', '仁厚'], boundaries: ['不主动攻伐', '不残暴待下'], longTermGoal: '守住益州一隅太平', privateAgenda: '不想打仗只想过太平日子', speechStyle: { register: '温弱', rhythm: '缓慢', habit: '犹豫不决', metaphor: '室与安' }, specialSchemes: [], passiveBonuses: ['益州民心不易下降'], weaknesses: ['暗弱无能', '用人不当', '过于优柔'], recruitmentDifficulty: 25, defectionTriggers: [] },
        { id: 'zhangRen', name: '张任', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang'], location: '', offMapLocation: 'chengdu', role: '忠烈之将', title: '将军', type: '武将', status: 'hidden', rarity: '名将', summary: '张任忠勇，落凤坡射杀庞统，宁死不降。', stats: { command: 78, strategy: 58, politics: 40, charm: 52, loyalty: 96, ambition: 22 }, personality: { brave: 84, cautious: 56, greedy: 8, loyal: 98, proud: 52, ruthless: 44, idealistic: 50 }, values: ['忠诚', '守土', '节义'], boundaries: ['绝不投降', '不背旧主'], longTermGoal: '以死守益州', privateAgenda: '做忠臣的典范', speechStyle: { register: '刚毅', rhythm: '斩截', habit: '言辞不屈', metaphor: '关与铁' }, specialSchemes: ['落凤坡设伏'], passiveBonuses: ['设伏成功率大幅提高'], weaknesses: ['过于刚烈', '不识时务'], recruitmentDifficulty: 72, defectionTriggers: [] },
        { id: 'yanYan', name: '严颜', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu'], location: '', offMapLocation: 'chengdu', role: '老将', title: '将军', type: '武将', status: 'hidden', rarity: '名将', summary: '严颜巴郡老将，被俘后只断头无降将，为张飞义释。', stats: { command: 76, strategy: 52, politics: 44, charm: 62, loyalty: 82, ambition: 24 }, personality: { brave: 86, cautious: 52, greedy: 10, loyal: 84, proud: 70, ruthless: 34, idealistic: 52 }, values: ['忠义', '老将尊严', '骨气'], boundaries: ['只有断头将军无降将军', '不畏惧死亡'], longTermGoal: '守巴郡尽忠职守', privateAgenda: '以老将之骨气令天下人敬佩', speechStyle: { register: '刚烈', rhythm: '短促', habit: '宁死不屈的气概', metaphor: '骨与铁' }, specialSchemes: ['老将坚守', '义释归心'], passiveBonuses: ['守城时士卒忠诚度不降'], weaknesses: ['年事已高', '兵力不足'], recruitmentDifficulty: 58, defectionTriggers: ['被义释', '主公降伏'] },
        { id: 'faZheng', name: '法正', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu'], location: '', offMapLocation: 'chengdu', role: '奇谋之士', title: '尚书令', type: '谋士', status: 'hidden', rarity: '名将', summary: '法正善奇谋，献策刘备取汉中，然心胸偏狭。', stats: { command: 54, strategy: 90, politics: 72, charm: 52, loyalty: 58, ambition: 56 }, personality: { brave: 46, cautious: 40, greedy: 38, loyal: 56, proud: 74, ruthless: 64, idealistic: 28 }, values: ['奇谋', '功名', '一饭之恩必报'], boundaries: ['不放过任何报复机会', '不做无利之事'], longTermGoal: '以奇谋助明主取天下', privateAgenda: '摆脱刘璋的冷落，投奔值得效力的明主', speechStyle: { register: '锐利', rhythm: '快速', habit: '一语中的', metaphor: '箭与隙' }, specialSchemes: ['献策取汉中', '奇谋定蜀'], passiveBonuses: ['奇谋成功率大幅提高'], weaknesses: ['心胸狭隘', '必报私怨'], recruitmentDifficulty: 62, defectionTriggers: ['刘璋冷落', '刘备入蜀'] },
        { id: 'liYan', name: '李严', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu'], location: '', offMapLocation: 'chengdu', role: '才干之臣', title: '中都护', type: '政务', status: 'hidden', rarity: '名将', summary: '李严才干出众，与诸葛亮同受托孤，后因争权被废。', stats: { command: 64, strategy: 74, politics: 82, charm: 56, loyalty: 52, ambition: 64 }, personality: { brave: 50, cautious: 58, greedy: 48, loyal: 50, proud: 70, ruthless: 44, idealistic: 26 }, values: ['才能', '权位', '功名'], boundaries: ['不屈服于人下', '不做无利之事'], longTermGoal: '在蜀汉权力结构中占据核心位置', privateAgenda: '与诸葛亮分庭抗礼', speechStyle: { register: '自负', rhythm: '条理', habit: '展示才能', metaphor: '权与术' }, specialSchemes: ['屯田积粮', '权谋固位'], passiveBonuses: ['后勤补给效率提高'], weaknesses: ['争权夺利', '忠诚度不足'], recruitmentDifficulty: 52, defectionTriggers: ['有更大权力诱惑'] },
        { id: 'huangQuan', name: '黄权', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu', 'cao'], location: '', offMapLocation: 'chengdu', role: '忠义之臣', title: '镇北将军', type: '谋士', status: 'hidden', rarity: '良才', summary: '黄权忠直，劝刘璋不听，后归刘备，夷陵之战降魏。', stats: { command: 56, strategy: 76, politics: 74, charm: 56, loyalty: 64, ambition: 34 }, personality: { brave: 48, cautious: 72, greedy: 12, loyal: 66, proud: 48, ruthless: 26, idealistic: 54 }, values: ['忠义', '大局', '务实'], boundaries: ['不做无意义的牺牲', '不违心进言'], longTermGoal: '找到值得效力的明主', privateAgenda: '以务实态度在乱世中生存', speechStyle: { register: '正直', rhythm: '平稳', habit: '直言利害', metaphor: '路与人' }, specialSchemes: ['战略建议'], passiveBonuses: ['战略判断准确率提高'], weaknesses: ['命运多舛', '归路被断'], recruitmentDifficulty: 48, defectionTriggers: ['归路被断', '主公败亡'] },
        { id: 'wuYi', name: '吴懿', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu'], location: '', offMapLocation: 'chengdu', role: '益州将领', title: '车骑将军', type: '武将', status: 'hidden', rarity: '良才', summary: '吴懿为益州重要将领，后随刘备，守汉中。', stats: { command: 68, strategy: 54, politics: 50, charm: 56, loyalty: 62, ambition: 36 }, personality: { brave: 62, cautious: 58, greedy: 24, loyal: 64, proud: 38, ruthless: 28, idealistic: 38 }, values: ['功名', '家族', '务实'], boundaries: ['不做无利之事', '不盲目牺牲'], longTermGoal: '在益州权力更迭中保全家族', privateAgenda: '随大势而动', speechStyle: { register: '沉稳', rhythm: '平实', habit: '审时度势', metaphor: '船与水' }, specialSchemes: ['守城固防'], passiveBonuses: ['城防效果提高'], weaknesses: ['缺乏主见', '随波逐流'], recruitmentDifficulty: 40, defectionTriggers: ['主公更替'] },
        { id: 'mengDa', name: '孟达', faction: 'liuzhang', originFaction: 'liuzhang', possibleFactions: ['liuzhang', 'liu', 'cao'], location: '', offMapLocation: 'chengdu', role: '反复之人', title: '将军', type: '武将', status: 'hidden', rarity: '良才', summary: '孟达反复无常，先叛刘璋，再叛刘备，终为司马懿所杀。', stats: { command: 62, strategy: 58, politics: 52, charm: 54, loyalty: 28, ambition: 62 }, personality: { brave: 48, cautious: 44, greedy: 56, loyal: 26, proud: 56, ruthless: 52, idealistic: 14 }, values: ['自保', '利益', '权力'], boundaries: ['不做无利之事', '不忠于已败之主'], longTermGoal: '在夹缝中求生存谋利益', privateAgenda: '谁强就投谁', speechStyle: { register: '机巧', rhythm: '灵活', habit: '见风使舵', metaphor: '墙与草' }, specialSchemes: ['反复倒戈'], passiveBonuses: ['倒戈时保留兵力'], weaknesses: ['忠诚度极低', '反复无常'], recruitmentDifficulty: 28, defectionTriggers: ['主公势危', '有更好靠山', '利益诱惑'] }
      ],
      zhanglu: [
        { id: 'zhangLu', name: '张鲁', faction: 'zhanglu', originFaction: 'zhanglu', possibleFactions: ['zhanglu'], location: '', offMapLocation: 'hanzhong', role: '五斗米道', title: '汉中太守', type: '政务', status: 'hidden', rarity: '名将', summary: '张鲁以五斗米道治汉中三十年，后降曹操。', stats: { command: 40, strategy: 56, politics: 72, charm: 70, loyalty: 56, ambition: 24 }, personality: { brave: 30, cautious: 64, greedy: 22, loyal: 56, proud: 40, ruthless: 16, idealistic: 62 }, values: ['道教', '仁政', '天命'], boundaries: ['不残暴治民', '不违背道法'], longTermGoal: '以五斗米道教化一方', privateAgenda: '保汉中太平，传布道法', speechStyle: { register: '玄虚', rhythm: '舒缓', habit: '引道经论事', metaphor: '道与天' }, specialSchemes: ['义舍济民', '鬼道治民'], passiveBonuses: ['民心不易下降'], weaknesses: ['军事能力有限', '过于理想化'], recruitmentDifficulty: 35, defectionTriggers: ['曹操征讨'] },
        { id: 'yangSong', name: '杨松', faction: 'zhanglu', originFaction: 'zhanglu', possibleFactions: ['zhanglu'], location: '', offMapLocation: 'hanzhong', role: '贪贿谋臣', title: '谋士', type: '政务', status: 'hidden', rarity: '良才', summary: '杨松贪财好货，受贿害马超，为人不齿。', stats: { command: 24, strategy: 48, politics: 52, charm: 34, loyalty: 28, ambition: 54 }, personality: { brave: 18, cautious: 42, greedy: 88, loyal: 24, proud: 30, ruthless: 56, idealistic: 6 }, values: ['财货', '享乐', '权力'], boundaries: ['不为义气做事', '不为廉耻约束'], longTermGoal: '聚敛财富', privateAgenda: '收受贿赂出卖情报', speechStyle: { register: '谄媚', rhythm: '讨好', habit: '见钱眼开', metaphor: '金与手' }, specialSchemes: ['受贿害人'], passiveBonuses: ['收买成功率提高'], weaknesses: ['贪得无厌', '毫无底线'], recruitmentDifficulty: 18, defectionTriggers: ['有人出更高价'] },
        { id: 'yanPu', name: '阎圃', faction: 'zhanglu', originFaction: 'zhanglu', possibleFactions: ['zhanglu'], location: '', offMapLocation: 'hanzhong', role: '忠直之臣', title: '功曹', type: '谋士', status: 'hidden', rarity: '良才', summary: '阎圃忠直，劝张鲁称王不可，后劝降曹操得善终。', stats: { command: 32, strategy: 68, politics: 72, charm: 54, loyalty: 74, ambition: 22 }, personality: { brave: 28, cautious: 72, greedy: 14, loyal: 76, proud: 34, ruthless: 16, idealistic: 50 }, values: ['务实', '忠主', '审时度势'], boundaries: ['不阿谀奉承', '不做无把握之事'], longTermGoal: '保全张鲁势力', privateAgenda: '在大势不可违时选择最优出路', speechStyle: { register: '沉稳', rhythm: '平实', habit: '以利弊分析进言', metaphor: '势与人' }, specialSchemes: ['劝降保身'], passiveBonuses: ['投降时保留更多资源'], weaknesses: ['缺乏进取心', '过于务实'], recruitmentDifficulty: 34, defectionTriggers: [] },
        { id: 'zhangWei', name: '张卫', faction: 'zhanglu', originFaction: 'zhanglu', possibleFactions: ['zhanglu'], location: '', offMapLocation: 'hanzhong', role: '张鲁之弟', title: '将军', type: '武将', status: 'hidden', rarity: '良才', summary: '张卫为张鲁之弟，守阳平关，力抗曹操。', stats: { command: 64, strategy: 46, politics: 38, charm: 44, loyalty: 78, ambition: 30 }, personality: { brave: 70, cautious: 50, greedy: 18, loyal: 80, proud: 42, ruthless: 30, idealistic: 38 }, values: ['家族', '守御', '忠义'], boundaries: ['不弃兄长', '不降敌'], longTermGoal: '守护汉中和张鲁', privateAgenda: '以武勇证明张氏不只是道士', speechStyle: { register: '刚直', rhythm: '短促', habit: '以军人方式说话', metaphor: '关与山' }, specialSchemes: ['阳平关固守'], passiveBonuses: ['关隘防御效果提高'], weaknesses: ['军事才能一般', '过于固执'], recruitmentDifficulty: 38, defectionTriggers: [] },
        { id: 'yangBai', name: '杨柏', faction: 'zhanglu', originFaction: 'zhanglu', possibleFactions: ['zhanglu'], location: '', offMapLocation: 'hanzhong', role: '汉中部将', title: '将军', type: '武将', status: 'hidden', rarity: '普通', summary: '杨柏为张鲁部将，与杨松同族。', stats: { command: 52, strategy: 38, politics: 34, charm: 38, loyalty: 50, ambition: 38 }, personality: { brave: 48, cautious: 40, greedy: 42, loyal: 48, proud: 34, ruthless: 36, idealistic: 22 }, values: ['自保', '利益', '家族'], boundaries: ['不做必死之事', '随杨松行事'], longTermGoal: '在汉中保持地位', privateAgenda: '依附杨松获取利益', speechStyle: { register: '平淡', rhythm: '随和', habit: '附和他人', metaphor: '草与风' }, specialSchemes: [], passiveBonuses: [], weaknesses: ['缺乏主见', '能力平庸'], recruitmentDifficulty: 24, defectionTriggers: ['主公势败'] }
      ],
      mateng: [
        { id: 'maTeng', name: '马腾', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng'], location: '', offMapLocation: 'liangzhou', role: '西凉军阀', title: '征西将军', type: '武将', status: 'hidden', rarity: '名将', summary: '马腾伏波将军之后，忠汉室，入朝被曹操所杀。', stats: { command: 78, strategy: 56, politics: 54, charm: 68, loyalty: 76, ambition: 42 }, personality: { brave: 82, cautious: 46, greedy: 22, loyal: 78, proud: 60, ruthless: 40, idealistic: 56 }, values: ['忠汉', '西凉', '义气'], boundaries: ['不背叛汉室', '不轻信曹操'], longTermGoal: '以伏波之后忠义立身', privateAgenda: '联合反曹力量', speechStyle: { register: '豪迈', rhythm: '直率', habit: '以忠义号召', metaphor: '马与汉旗' }, specialSchemes: ['衣带诏'], passiveBonuses: ['西凉骑兵效果提高'], weaknesses: ['入朝被控制', '过于忠义轻信'], recruitmentDifficulty: 60, defectionTriggers: [] },
        { id: 'hanSui', name: '韩遂', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng', 'cao'], location: '', offMapLocation: 'liangzhou', role: '西凉军阀', title: '镇西将军', type: '武将', status: 'hidden', rarity: '名将', summary: '韩遂与马腾亦友亦敌，老于世故，终为曹操所破。', stats: { command: 72, strategy: 66, politics: 58, charm: 54, loyalty: 40, ambition: 56 }, personality: { brave: 56, cautious: 68, greedy: 42, loyal: 38, proud: 52, ruthless: 58, idealistic: 18 }, values: ['自保', '西凉', '利益'], boundaries: ['不信任任何人', '不做亏本买卖'], longTermGoal: '在西凉保持半独立地位', privateAgenda: '与马腾既合作又竞争', speechStyle: { register: '老辣', rhythm: '迂回', habit: '话里有话', metaphor: '沙与风' }, specialSchemes: ['离间计', '反间马超'], passiveBonuses: ['离间成功率提高'], weaknesses: ['反复无常', '年迈力衰'], recruitmentDifficulty: 50, defectionTriggers: ['被离间', '利益受损'] },
        { id: 'maChao', name: '马超', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng', 'liu'], location: '', offMapLocation: 'liangzhou', role: '锦马超', title: '骠骑将军', type: '武将', status: 'hidden', rarity: '传奇', summary: '马超锦马超，西凉猛将，渭水之战杀得曹操割须弃袍。', stats: { command: 90, strategy: 56, politics: 30, charm: 78, loyalty: 52, ambition: 66 }, personality: { brave: 96, cautious: 22, greedy: 28, loyal: 50, proud: 82, ruthless: 62, idealistic: 34 }, values: ['勇武', '复仇', '家族荣誉'], boundaries: ['不放过杀父仇人', '不屈服于强者'], longTermGoal: '为父报仇，重振西凉马氏', privateAgenda: '以武力证明马氏不可辱', speechStyle: { register: '冷傲', rhythm: '短促', habit: '以武服人', metaphor: '枪与血' }, specialSchemes: ['渭水六战', '西凉铁骑'], passiveBonuses: ['骑兵攻击力大幅提高'], weaknesses: ['中计轻信', '不善政治', '过于冲动'], recruitmentDifficulty: 78, defectionTriggers: ['西凉变乱', '曹操压迫', '刘备入蜀'] },
        { id: 'maDai', name: '马岱', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng', 'liu'], location: '', offMapLocation: 'liangzhou', role: '马超从弟', title: '平北将军', type: '武将', status: 'hidden', rarity: '良才', summary: '马岱随马超征战，后归刘备，斩魏延。', stats: { command: 68, strategy: 50, politics: 36, charm: 48, loyalty: 72, ambition: 34 }, personality: { brave: 66, cautious: 52, greedy: 16, loyal: 74, proud: 38, ruthless: 40, idealistic: 40 }, values: ['从兄', '忠义', '功名'], boundaries: ['不违马超之命', '不背主'], longTermGoal: '随马超建功立业', privateAgenda: '做马超最可靠的副手', speechStyle: { register: '沉稳', rhythm: '平实', habit: '不多言语', metaphor: '盾与从' }, specialSchemes: ['斩魏延'], passiveBonuses: ['跟随主将时攻击力提高'], weaknesses: ['缺乏独立指挥能力', '过于依附马超'], recruitmentDifficulty: 42, defectionTriggers: ['马超归蜀'] },
        { id: 'pangDe', name: '庞德', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng', 'cao'], location: '', offMapLocation: 'liangzhou', role: '白马将军', title: '立义将军', type: '武将', status: 'hidden', rarity: '名将', summary: '庞德抬棺决战，宁死不降关羽，忠勇可嘉。', stats: { command: 82, strategy: 54, politics: 34, charm: 52, loyalty: 76, ambition: 40 }, personality: { brave: 90, cautious: 42, greedy: 14, loyal: 78, proud: 60, ruthless: 48, idealistic: 40 }, values: ['忠勇', '武名', '不屈'], boundaries: ['不降敌', '不畏死'], longTermGoal: '以忠勇扬名天下', privateAgenda: '证明自己的忠诚和勇武', speechStyle: { register: '刚烈', rhythm: '决绝', habit: '以死明志', metaphor: '棺与刀' }, specialSchemes: ['抬棺决战', '白马义从'], passiveBonuses: ['决死攻击时伤害暴增'], weaknesses: ['过于刚烈', '归降曹操后受猜忌'], recruitmentDifficulty: 62, defectionTriggers: ['马超离去', '被曹操重用'] },
        { id: 'maYunlu', name: '马云禄', faction: 'mateng', originFaction: 'mateng', possibleFactions: ['mateng', 'liu'], location: '', offMapLocation: 'liangzhou', role: '马氏女将', title: '女将', type: '武将', status: 'hidden', rarity: '良才', summary: '马云禄为马超之妹，传为赵云之妻，武艺不俗。', stats: { command: 66, strategy: 48, politics: 36, charm: 72, loyalty: 74, ambition: 32 }, personality: { brave: 76, cautious: 40, greedy: 10, loyal: 76, proud: 52, ruthless: 28, idealistic: 52 }, values: ['家族', '武艺', '自由'], boundaries: ['不违背兄长', '不退缩'], longTermGoal: '为马氏家族征战', privateAgenda: '证明女子亦可沙场立功', speechStyle: { register: '英气', rhythm: '快捷', habit: '以行动说话', metaphor: '枪与风' }, specialSchemes: ['女将突阵'], passiveBonuses: ['女将出战时友军士气提高'], weaknesses: ['实战经验有限', '身份特殊受限制'], recruitmentDifficulty: 48, defectionTriggers: ['马超归蜀'] }
      ],
      gongsun: [
        { id: 'gongsunZan', name: '公孙瓒', faction: 'gongsun', originFaction: 'gongsun', possibleFactions: ['gongsun'], location: '', offMapLocation: 'youzhou', role: '白马将军', title: '前将军', type: '武将', status: 'hidden', rarity: '名将', summary: '公孙瓒白马义从，雄踞幽州，终为袁绍所灭。', stats: { command: 80, strategy: 52, politics: 38, charm: 58, loyalty: 60, ambition: 64 }, personality: { brave: 84, cautious: 28, greedy: 40, loyal: 56, proud: 76, ruthless: 62, idealistic: 28 }, values: ['武勇', '自立', '白马'], boundaries: ['不向袁绍屈服', '不信任士族'], longTermGoal: '以白马义从雄踞北方', privateAgenda: '做北方最强的军阀', speechStyle: { register: '傲慢', rhythm: '急促', habit: '以武力压人', metaphor: '马与冰' }, specialSchemes: ['白马义从冲锋'], passiveBonuses: ['骑兵战力提高'], weaknesses: ['过于骄傲', '不善治理', '忌惮士族'], recruitmentDifficulty: 58, defectionTriggers: [] },
        { id: 'zhaoYun', name: '赵云', faction: 'gongsun', originFaction: 'gongsun', possibleFactions: ['gongsun', 'liu'], location: '', offMapLocation: 'youzhou', role: '常山赵子龙', title: '镇军将军', type: '武将', status: 'hidden', rarity: '传奇', summary: '赵云常山真定人，长坂坡七进七出，忠勇无双。', stats: { command: 88, strategy: 68, politics: 52, charm: 80, loyalty: 96, ambition: 24 }, personality: { brave: 96, cautious: 62, greedy: 6, loyal: 98, proud: 38, ruthless: 18, idealistic: 72 }, values: ['忠义', '仁德', '救民'], boundaries: ['不事不义之主', '不抛弃弱者'], longTermGoal: '追随仁德之主安定天下', privateAgenda: '在公孙瓒处观察刘备是否值得追随', speechStyle: { register: '沉稳', rhythm: '利落', habit: '少言多做', metaphor: '枪与盾' }, specialSchemes: ['长坂坡七进七出', '截江夺斗', '空营计'], passiveBonuses: ['护卫时防御大幅提高'], weaknesses: ['过于忠义不善争权', '不争功'], recruitmentDifficulty: 85, defectionTriggers: ['公孙瓒败亡', '刘备仁名', '长坂旧缘'] },
        { id: 'tianKai', name: '田楷', faction: 'gongsun', originFaction: 'gongsun', possibleFactions: ['gongsun'], location: '', offMapLocation: 'youzhou', role: '幽州将领', title: '徐州刺史', type: '武将', status: 'hidden', rarity: '普通', summary: '田楷为公孙瓒部将，曾守青州。', stats: { command: 56, strategy: 42, politics: 36, charm: 44, loyalty: 62, ambition: 28 }, personality: { brave: 52, cautious: 50, greedy: 18, loyal: 64, proud: 32, ruthless: 26, idealistic: 34 }, values: ['忠诚', '守土', '本分'], boundaries: ['不违军令', '不做非分之想'], longTermGoal: '守住公孙瓒的青州地盘', privateAgenda: '做可靠的守将', speechStyle: { register: '朴实', rhythm: '平直', habit: '不多言语', metaphor: '墙与土' }, specialSchemes: [], passiveBonuses: ['守城时防御小幅提高'], weaknesses: ['能力平庸', '缺乏主见'], recruitmentDifficulty: 26, defectionTriggers: [] },
        { id: 'yanGang', name: '严纲', faction: 'gongsun', originFaction: 'gongsun', possibleFactions: ['gongsun'], location: '', offMapLocation: 'youzhou', role: '幽州猛将', title: '冀州刺史', type: '武将', status: 'hidden', rarity: '良才', summary: '严纲为公孙瓒前锋，界桥之战阵亡。', stats: { command: 64, strategy: 36, politics: 26, charm: 44, loyalty: 74, ambition: 34 }, personality: { brave: 82, cautious: 20, greedy: 22, loyal: 76, proud: 46, ruthless: 40, idealistic: 32 }, values: ['勇武', '冲锋', '忠义'], boundaries: ['不退缩', '不违主将之命'], longTermGoal: '以先锋之勇为公孙瓒开路', privateAgenda: '做白马义从的锋刃', speechStyle: { register: '急切', rhythm: '短促', habit: '求战心切', metaphor: '矛与冲' }, specialSchemes: ['白马冲锋'], passiveBonuses: ['首战攻击力提高'], weaknesses: ['过于冒进', '不善谋略'], recruitmentDifficulty: 32, defectionTriggers: [] }
      ],
      yuanshu: [
        { id: 'yuanShu', name: '袁术', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '僭越之主', title: '仲家帝', type: '政务', status: 'hidden', rarity: '名将', summary: '袁术妄称帝号，荒淫无道，众叛亲离而亡。', stats: { command: 44, strategy: 46, politics: 50, charm: 58, loyalty: 42, ambition: 92 }, personality: { brave: 30, cautious: 28, greedy: 82, loyal: 38, proud: 92, ruthless: 58, idealistic: 10 }, values: ['称帝', '享乐', '门第'], boundaries: ['不承认他人高于己', '不委屈自己'], longTermGoal: '称帝号令天下', privateAgenda: '以袁氏嫡出之名凌驾天下', speechStyle: { register: '狂妄', rhythm: '傲慢', habit: '自称为帝', metaphor: '玺与座' }, specialSchemes: ['称帝号令'], passiveBonuses: ['初期声望提高'], weaknesses: ['荒淫无道', '众叛亲离', '妄称帝号'], recruitmentDifficulty: 30, defectionTriggers: [] },
        { id: 'jiLing', name: '纪灵', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '袁术大将', title: '将军', type: '武将', status: 'hidden', rarity: '良才', summary: '纪灵为袁术麾下第一勇将，使三尖两刃刀。', stats: { command: 74, strategy: 44, politics: 28, charm: 46, loyalty: 70, ambition: 38 }, personality: { brave: 78, cautious: 42, greedy: 30, loyal: 72, proud: 48, ruthless: 44, idealistic: 26 }, values: ['武勇', '忠主', '战功'], boundaries: ['不违主公之命', '不惧强敌'], longTermGoal: '以武勇为袁术征战', privateAgenda: '做袁术最可靠的武将', speechStyle: { register: '粗豪', rhythm: '直率', habit: '以武力论事', metaphor: '刀与阵' }, specialSchemes: ['三尖刀破阵'], passiveBonuses: ['对阵时攻击力提高'], weaknesses: ['不善谋略', '主公无能'], recruitmentDifficulty: 40, defectionTriggers: ['袁术败亡'] },
        { id: 'yanXiang', name: '阎象', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '忠谏之臣', title: '主簿', type: '谋士', status: 'hidden', rarity: '良才', summary: '阎象力谏袁术不可称帝，不听。', stats: { command: 28, strategy: 66, politics: 68, charm: 50, loyalty: 78, ambition: 20 }, personality: { brave: 30, cautious: 72, greedy: 10, loyal: 80, proud: 34, ruthless: 14, idealistic: 60 }, values: ['忠谏', '大义', '法度'], boundaries: ['不阿谀奉承', '不违背良心'], longTermGoal: '阻止袁术称帝', privateAgenda: '以死谏保全名节', speechStyle: { register: '恳切', rhythm: '沉重', habit: '反复劝谏', metaphor: '言与危' }, specialSchemes: ['谏阻称帝'], passiveBonuses: ['谏言效果提高'], weaknesses: ['谏言不听', '无力改变局势'], recruitmentDifficulty: 30, defectionTriggers: [] },
        { id: 'qiaoRui', name: '桥蕤', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '袁术将领', title: '将军', type: '武将', status: 'hidden', rarity: '良才', summary: '桥蕤为袁术部将，守寿春，兵败而亡。', stats: { command: 60, strategy: 40, politics: 32, charm: 42, loyalty: 66, ambition: 34 }, personality: { brave: 64, cautious: 44, greedy: 24, loyal: 68, proud: 38, ruthless: 34, idealistic: 28 }, values: ['忠主', '战功', '守土'], boundaries: ['不弃城', '不降敌'], longTermGoal: '守住袁术的城池', privateAgenda: '尽力为袁术续命', speechStyle: { register: '坚定', rhythm: '平实', habit: '以守城为要', metaphor: '城与血' }, specialSchemes: ['坚守寿春'], passiveBonuses: ['守城时防御提高'], weaknesses: ['能力有限', '主公无能'], recruitmentDifficulty: 28, defectionTriggers: ['袁术败亡'] },
        { id: 'zhangXun', name: '张勋', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '袁术大将', title: '大将军', type: '武将', status: 'hidden', rarity: '良才', summary: '张勋为袁术后期主将，率军攻吕布大败。', stats: { command: 62, strategy: 42, politics: 30, charm: 40, loyalty: 58, ambition: 42 }, personality: { brave: 56, cautious: 40, greedy: 36, loyal: 56, proud: 44, ruthless: 38, idealistic: 22 }, values: ['功名', '地位', '自保'], boundaries: ['不做必死之事', '不轻易投降'], longTermGoal: '在袁术麾下保持地位', privateAgenda: '在乱局中自保', speechStyle: { register: '平淡', rhythm: '普通', habit: '按部就班', metaphor: '旗与步' }, specialSchemes: [], passiveBonuses: [], weaknesses: ['才能有限', '缺乏战略眼光'], recruitmentDifficulty: 26, defectionTriggers: ['袁术败亡'] },
        { id: 'leiBo', name: '雷薄', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '袁术部将', title: '将军', type: '武将', status: 'hidden', rarity: '普通', summary: '雷薄为袁术部将，后叛逃。', stats: { command: 50, strategy: 34, politics: 28, charm: 34, loyalty: 30, ambition: 44 }, personality: { brave: 44, cautious: 38, greedy: 50, loyal: 28, proud: 34, ruthless: 44, idealistic: 10 }, values: ['自保', '利益', '自由'], boundaries: ['不做必死之事', '不忠于必败之主'], longTermGoal: '在乱世中保全自己', privateAgenda: '看局势决定去留', speechStyle: { register: '粗朴', rhythm: '短促', habit: '少言', metaphor: '草与风' }, specialSchemes: [], passiveBonuses: [], weaknesses: ['忠诚度低', '随时可能叛逃'], recruitmentDifficulty: 20, defectionTriggers: ['主公势败', '有利可图'] },
        { id: 'chenLan', name: '陈兰', faction: 'yuanshu', originFaction: 'yuanshu', possibleFactions: ['yuanshu'], location: '', offMapLocation: 'shouchun', role: '袁术部将', title: '将军', type: '武将', status: 'hidden', rarity: '普通', summary: '陈兰为袁术部将，与雷薄同叛。', stats: { command: 48, strategy: 32, politics: 26, charm: 32, loyalty: 28, ambition: 46 }, personality: { brave: 42, cautious: 36, greedy: 52, loyal: 26, proud: 32, ruthless: 42, idealistic: 8 }, values: ['自保', '利益', '自由'], boundaries: ['不做必死之事', '不忠于必败之主'], longTermGoal: '在乱世中保全自己', privateAgenda: '与雷薄共进退', speechStyle: { register: '粗朴', rhythm: '短促', habit: '附和雷薄', metaphor: '影与草' }, specialSchemes: [], passiveBonuses: [], weaknesses: ['忠诚度低', '随雷薄叛逃'], recruitmentDifficulty: 18, defectionTriggers: ['主公势败', '有利可图'] }
      ],
      local: [
        { id: 'huaTuo', name: '华佗', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: 'xuchang', role: '神医', title: '神医', type: '医者', status: 'hidden', rarity: '传奇', summary: '华佗神医，发明麻沸散，为曹操所杀。', stats: { command: 18, strategy: 52, politics: 46, charm: 78, loyalty: 48, ambition: 12 }, personality: { brave: 34, cautious: 66, greedy: 6, loyal: 46, proud: 42, ruthless: 8, idealistic: 80 }, values: ['医术', '救人', '自由'], boundaries: ['不以医术害人', '不屈服于权贵'], longTermGoal: '以医术济世救人', privateAgenda: '完善外科手术术法', speechStyle: { register: '从容', rhythm: '温和', habit: '以病症喻事', metaphor: '药与脉' }, specialSchemes: ['麻沸散', '五禽戏'], passiveBonuses: ['治疗效果大幅提高'], weaknesses: ['不愿专为一人服务', '被曹操所忌'], recruitmentDifficulty: 75, defectionTriggers: [] },
        { id: 'zuoCi', name: '左慈', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: 'xuchang', role: '方士', title: '乌角先生', type: '名士', status: 'hidden', rarity: '名将', summary: '左慈戏曹操，遁甲奇术，世人以为仙。', stats: { command: 20, strategy: 70, politics: 42, charm: 62, loyalty: 30, ambition: 8 }, personality: { brave: 40, cautious: 56, greedy: 4, loyal: 28, proud: 56, ruthless: 18, idealistic: 78 }, values: ['道术', '自由', '戏弄权贵'], boundaries: ['不为权贵所用', '不认真对待世俗权力'], longTermGoal: '以道术逍遥天地', privateAgenda: '戏弄天下权贵以证道法', speechStyle: { register: '玄虚', rhythm: '飘忽', habit: '言辞诡谲', metaphor: '云与幻' }, specialSchemes: ['掷杯戏曹', '遁甲奇术'], passiveBonuses: ['遁走成功率极高'], weaknesses: ['不涉世事', '道术不为正用'], recruitmentDifficulty: 80, defectionTriggers: [] },
        { id: 'siMaHui', name: '司马徽', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: 'xinye', offMapLocation: 'longzhong', role: '水镜先生', title: '隐士', type: '谋士', status: 'rumored', rarity: '名将', summary: '水镜先生司马徽，识人如镜，荐卧龙凤雏。', stats: { command: 22, strategy: 82, politics: 72, charm: 78, loyalty: 40, ambition: 8 }, personality: { brave: 20, cautious: 78, greedy: 4, loyal: 38, proud: 40, ruthless: 6, idealistic: 88 }, values: ['识人', '隐逸', '教化'], boundaries: ['不出仕', '不推举不当之人'], longTermGoal: '以慧眼识天下英才', privateAgenda: '在幕后推动人才流向值得的明主', speechStyle: { register: '淡泊', rhythm: '舒缓', habit: '只说半句让自悟', metaphor: '镜与水' }, specialSchemes: ['水镜荐才'], passiveBonuses: ['识人准确率大幅提高'], weaknesses: ['不出仕', '只荐不助'], recruitmentDifficulty: 82, defectionTriggers: [] },
        { id: 'huangChengYan', name: '黄承彦', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: 'xinye', offMapLocation: 'longzhong', role: '名士', title: '沔南名士', type: '谋士', status: 'rumored', rarity: '良才', summary: '黄承彦诸葛亮岳父，沔南名士。', stats: { command: 18, strategy: 64, politics: 58, charm: 62, loyalty: 38, ambition: 6 }, personality: { brave: 16, cautious: 72, greedy: 6, loyal: 36, proud: 32, ruthless: 4, idealistic: 76 }, values: ['学识', '嫁女得才', '隐逸'], boundaries: ['不干预女婿之事', '不出仕'], longTermGoal: '将女儿嫁给最有才华的人', privateAgenda: '在荆州名士圈中保持影响力', speechStyle: { register: '风雅', rhythm: '从容', habit: '以女婿自豪', metaphor: '花与才' }, specialSchemes: ['引荐诸葛'], passiveBonuses: ['名士圈好感度提高'], weaknesses: ['无实际权力', '仅限社交影响'], recruitmentDifficulty: 50, defectionTriggers: [] },
        { id: 'pangDeGong', name: '庞德公', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: 'xinye', offMapLocation: 'longzhong', role: '荆州隐士', title: '襄阳隐士', type: '谋士', status: 'rumored', rarity: '良才', summary: '庞德公荆州隐士，品评人物，庞统之叔。', stats: { command: 16, strategy: 70, politics: 66, charm: 68, loyalty: 36, ambition: 6 }, personality: { brave: 14, cautious: 76, greedy: 4, loyal: 34, proud: 38, ruthless: 4, idealistic: 84 }, values: ['品评', '隐逸', '教化'], boundaries: ['不出仕', '不当面贬人'], longTermGoal: '品评天下人物传后世', privateAgenda: '维护荆州隐士圈的清流地位', speechStyle: { register: '清雅', rhythm: '从容', habit: '以品评定高下', metaphor: '尺与水' }, specialSchemes: ['品评天下'], passiveBonuses: ['识人准确率提高'], weaknesses: ['不出仕', '影响力限于名士圈'], recruitmentDifficulty: 60, defectionTriggers: [] },
        { id: 'xuShao', name: '许劭', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: '', offMapLocation: 'runan', role: '月旦评', title: '汝南名士', type: '谋士', status: 'hidden', rarity: '良才', summary: '许劭月旦评天下人物，评曹操治世之能臣乱世之奸雄。', stats: { command: 14, strategy: 66, politics: 64, charm: 70, loyalty: 32, ambition: 8 }, personality: { brave: 12, cautious: 74, greedy: 8, loyal: 30, proud: 58, ruthless: 10, idealistic: 72 }, values: ['品评', '名节', '公正'], boundaries: ['不阿谀权贵', '不修改评价'], longTermGoal: '以月旦评传名后世', privateAgenda: '维持月旦评的公正和权威', speechStyle: { register: '尖锐', rhythm: '判语式', habit: '一语定论', metaphor: '秤与判' }, specialSchemes: ['月旦评'], passiveBonuses: ['识人准确率提高'], weaknesses: ['拒绝权贵邀约', '影响力有限'], recruitmentDifficulty: 55, defectionTriggers: [] },
        { id: 'qiaoXuan', name: '乔玄', faction: 'local', originFaction: 'local', possibleFactions: ['local'], location: '', offMapLocation: 'wan', role: '汉室老臣', title: '太尉', type: '政务', status: 'hidden', rarity: '良才', summary: '乔玄汉室老臣，识曹操为非常之人，二乔之父。', stats: { command: 24, strategy: 58, politics: 72, charm: 74, loyalty: 46, ambition: 10 }, personality: { brave: 20, cautious: 70, greedy: 8, loyal: 48, proud: 36, ruthless: 8, idealistic: 68 }, values: ['识才', '汉室', '家风'], boundaries: ['不以权谋私', '不违礼法'], longTermGoal: '以老臣之身匡正朝纲', privateAgenda: '为二女寻良配', speechStyle: { register: '端方', rhythm: '庄重', habit: '以老臣身份论事', metaphor: '鼎与家' }, specialSchemes: ['识才举贤'], passiveBonuses: ['名士好感度提高'], weaknesses: ['年事已高', '无实权'], recruitmentDifficulty: 40, defectionTriggers: [] }
      ]
    };

    function normalizeHistoricalCharacterRecord(record) {
      const normalized = { ...record };

      normalized.faction ||= 'local';
      normalized.location ||= '';
      normalized.role ||= normalized.type || '人物';
      normalized.title ||= normalized.role;
      normalized.type ||= '武将';
      normalized.status ||= 'hidden';
      normalized.rarity ||= '良才';
      normalized.summary ||= normalized.name + '是乱世中可被发现的人物。';

      normalized.stats ||= {};
      normalized.stats.command ??= 50;
      normalized.stats.strategy ??= 50;
      normalized.stats.politics ??= 50;
      normalized.stats.charm ??= 50;
      normalized.stats.loyalty ??= 60;
      normalized.stats.ambition ??= 40;

      normalized.personality ||= { brave: 42, cautious: 52, greedy: 28, loyal: 52, proud: 40, ruthless: 28, idealistic: 44 };
      normalized.values ||= ['功名'];
      normalized.boundaries ||= ['不轻易背主'];
      normalized.longTermGoal ||= '在乱世中建立功业';
      normalized.privateAgenda ||= '观察天下局势';
      normalized.speechStyle ||= { register: '沉稳', rhythm: '平衡', habit: '', metaphor: '' };
      normalized.specialSchemes ||= [];
      normalized.passiveBonuses ||= [];
      normalized.weaknesses ||= ['立场未明'];
      normalized.recruitmentDifficulty ??= 60;
      normalized.discoveredBy ||= '';

      normalized.originFaction ||= normalized.faction;
      normalized.possibleFactions ||= [normalized.faction];
      normalized.recruitedBy ||= null;
      normalized.defectionTriggers ||= [];

      return normalized;
    }

    function normalizeCharacterLocation(record) {
      if (!record.location) return record;

      const fallback = {
        xuzhou: 'xiaopei',
        longzhong: 'xinye',
        chengdu: 'yongan',
        liangzhou: 'mateng',
        tianshui: 'mateng'
      };

      if (CITY_BLUEPRINTS?.[record.location]) return record;

      const mapped = fallback[record.location];
      if (mapped && CITY_BLUEPRINTS?.[mapped]) {
        record.offMapLocation = record.location;
        record.location = mapped;
        return record;
      }

      record.offMapLocation = record.location;
      record.location = '';
      return record;
    }

    function buildHistoricalCharacterBlueprints() {
      const result = {};
      const seen = new Set();

      Object.values(HISTORICAL_CHARACTER_PACKS).flat().forEach(record => {
        if (!record || !record.id) return;

        if (seen.has(record.id) || result[record.id] || BASE_CHARACTER_BLUEPRINTS?.[record.id]) {
          console.warn('重复人物 id，已跳过：', record.id, record.name);
          return;
        }

        seen.add(record.id);
        result[record.id] = characterBlueprint(record.id, record.name, normalizeHistoricalCharacterRecord(record));
      });

      return result;
    }

    const CHARACTER_BLUEPRINTS = {
      ...BASE_CHARACTER_BLUEPRINTS,
      ...buildHistoricalCharacterBlueprints()
    };


    const RANDOM_TALENT_NAMES = ['杜景', '韩绍', '程钧', '陆旻', '沈玠', '顾韬', '许岱', '钟仪', '谢衡', '苏靖', '林越', '赵宁'];
    const RANDOM_TALENT_TYPES = ['武将', '谋士', '政务', '豪强', '医者', '商人', '游侠'];
    const RANDOM_TALENT_LOCATIONS = ['guiyang', 'changsha', 'jiangling', 'jiangxia', 'xiangyang'];

    const NPC_PERSONA_OVERRIDES = {
      liuBiao: {
        values: ['荆州稳定', '名分', '缓进'],
        boundaries: ['不容桂阳公开越权', '不喜冒进征伐'],
        longTermGoal: '稳住荆州门户，借桂阳牵制荆南而不让局势失控。',
        privateAgenda: '观察你是否只是可用亲信，还是会变成新的割据风险。',
        speechStyle: { register: '含蓄官样', rhythm: '缓慢', habit: '常把话放到荆州全局里说', metaphor: '舟楫与门户' },
        initiative: { lastTurn: -99, cooldown: 4, urgency: 8 }
      },
      caiMao: {
        values: ['士族利益', '军权', '门第'],
        boundaries: ['不接受外来者快速染指荆州军权'],
        longTermGoal: '维护蔡氏在襄阳军政中的位置，防止桂阳坐大。',
        privateAgenda: '试探你是否会绕过襄阳直接收买荆南士族。',
        speechStyle: { register: '冷硬士族', rhythm: '短句', habit: '喜欢把礼法和军纪挂在嘴边', metaphor: '门墙与兵符' },
        initiative: { lastTurn: -99, cooldown: 5, urgency: 6 }
      },
      kuaiYue: {
        values: ['审势', '可持续的利益', '谋定后动'],
        boundaries: ['厌恶无后手的蛮干'],
        longTermGoal: '判断谁能真正稳住荆南，并把自己的判断押在最有前途的一边。',
        privateAgenda: '用一次次问答校准你的野心、耐心和用人尺度。',
        speechStyle: { register: '谋臣式', rhythm: '层层递进', habit: '常先退半步再点破要害', metaphor: '棋路与余地' },
        initiative: { lastTurn: -99, cooldown: 3, urgency: 10 }
      },
      huangZu: {
        values: ['江夏防务', '水路', '军中威信'],
        boundaries: ['不愿被当作只会听命的边将'],
        longTermGoal: '守住江夏水口，同时判断桂阳是否值得军事配合。',
        privateAgenda: '希望你证明自己懂军务，而不是只懂文书和权谋。',
        speechStyle: { register: '老将口吻', rhythm: '粗短', habit: '先问兵粮，再谈虚名', metaphor: '水口与营寨' },
        initiative: { lastTurn: -99, cooldown: 5, urgency: 6 }
      },
      wenPin: {
        values: ['军令', '信用', '守备'],
        boundaries: ['最忌承诺后不执行'],
        longTermGoal: '建立一套能守住荆南的军令秩序。',
        privateAgenda: '想看你是否尊重军令，是否愿意给将领明确目标。',
        speechStyle: { register: '军人直言', rhythm: '利落', habit: '句句落到军令和期限', metaphor: '营门与军令' },
        initiative: { lastTurn: -99, cooldown: 4, urgency: 9 }
      },
      guiyangClans: {
        values: ['乡里利益', '族产', '生存空间'],
        boundaries: ['不容官府一次性夺尽地方利益'],
        longTermGoal: '保住桂阳乡里的实际影响力，在新主官手下争取可谈的余地。',
        privateAgenda: '表面恭顺，暗中比较你和旧秩序谁更可依靠。',
        speechStyle: { register: '地方豪强', rhythm: '绕弯', habit: '常以乡里安生作借口谈条件', metaphor: '田界与宗祠' },
        initiative: { lastTurn: -99, cooldown: 3, urgency: 12 }
      },
      jingnanGentry: {
        values: ['名声', '士林秩序', '长远安定'],
        boundaries: ['不愿与残暴或失信者深交'],
        longTermGoal: '为荆南士族寻找一个既能安民又不轻慢士林的靠山。',
        privateAgenda: '通过荐才和舆论试探你是否值得士林背书。',
        speechStyle: { register: '士人雅言', rhythm: '委婉', habit: '常把人心和名望连在一起', metaphor: '清议与门生' },
        initiative: { lastTurn: -99, cooldown: 4, urgency: 8 }
      },
      localOfficials: {
        values: ['府衙秩序', '饭碗', '少出乱子'],
        boundaries: ['害怕频繁清洗与背锅'],
        longTermGoal: '在新主官治下保住府衙运转，并避免成为豪强与官府夹缝中的牺牲品。',
        privateAgenda: '向你透露可控的实情，同时给自己留退路。',
        speechStyle: { register: '小吏谨慎', rhythm: '细碎', habit: '常说账册、名册和旧例', metaphor: '文书与印绶' },
        initiative: { lastTurn: -99, cooldown: 3, urgency: 7 }
      }
    };

    function uniqueTextList(items) {
      return Array.from(new Set((items || []).filter(Boolean).map(item => String(item)))).slice(0, 6);
    }

    function inferNpcPersona(record) {
      const type = record.type || '政务';
      const faction = record.faction || 'local';
      const isRecruited = record.status === 'recruited' || faction === 'player';
      const base = {
        values: isRecruited ? ['主从信义', '立功'] : faction === 'local' ? ['地方利益', '自保'] : ['势力利益', '审时度势'],
        boundaries: isRecruited ? ['不愿被长期忽视'] : ['不愿轻易交出筹码'],
        longTermGoal: isRecruited ? '在你麾下找到自己的位置，并证明自身价值。' : '在乱局中保住自身利益，等待更明确的局势。',
        privateAgenda: isRecruited ? '希望你兑现用人承诺。' : '先观察你的实力、信誉和底线。',
        speechStyle: { register: '平实', rhythm: '平衡', habit: '先看事实再表态', metaphor: '局势' },
        initiative: { lastTurn: -99, cooldown: 4, urgency: 4 }
      };
      if (type === '武将') {
        base.values = uniqueTextList(base.values.concat(['军功', '军令']));
        base.longTermGoal = isRecruited ? '争取军功与明确军令，在战事中证明自己。' : '判断谁能给自己可靠的军令和战场。';
        base.speechStyle = { register: '军伍口吻', rhythm: '短促', habit: '先问兵粮军令', metaphor: '营寨' };
      } else if (type === '谋士') {
        base.values = uniqueTextList(base.values.concat(['审势', '谋定后动']));
        base.longTermGoal = isRecruited ? '把判断化成可执行的谋略，提升自己在幕府中的分量。' : '寻找值得下注的主君或盟友。';
        base.speechStyle = { register: '谋臣式', rhythm: '递进', habit: '先摆风险再说机会', metaphor: '棋路' };
      } else if (type === '豪强') {
        base.values = uniqueTextList(base.values.concat(['族产', '乡里']));
        base.longTermGoal = '保住地方根基，在官府与乡里之间争取最大余地。';
        base.speechStyle = { register: '乡里口吻', rhythm: '绕弯', habit: '常以百姓和族产作话头', metaphor: '田界' };
      } else if (type === '政务') {
        base.values = uniqueTextList(base.values.concat(['秩序', '名分']));
        base.longTermGoal = isRecruited ? '让政务有章可循，减少府衙和地方的反噬。' : '判断桂阳新政是否可长期合作。';
      }
      return base;
    }

    const TAX_POLICIES = {
      light: { name: '轻税养民', tax: 0.72, public: 2.2, order: 0.6, growth: 1.18, commerce: 0.8 },
      normal: { name: '常规税收', tax: 1, public: 0.1, order: 0.1, growth: 1, commerce: 1 },
      heavy: { name: '重税筹军', tax: 1.38, public: -2.8, order: -1.4, growth: 0.78, commerce: 0.86 },
      wartime: { name: '战时征发', tax: 1.85, public: -6.4, order: -3.8, growth: 0.5, commerce: 0.62 }
    };

    const GRAIN_POLICIES = {
      market: { name: '平价收粮', food: 1.08, public: 0.3, order: 0.2, moneyCost: 140, growth: 1 },
      office: { name: '官府征粮', food: 1.24, public: -1.8, order: -1.1, moneyCost: 0, growth: 0.92 },
      forced: { name: '强征军粮', food: 1.58, public: -5.2, order: -3.5, moneyCost: 0, growth: 0.68 },
      tuntian: { name: '屯田制', food: 0.9, public: -0.4, order: 0.3, moneyCost: 90, growth: 1.24 }
    };

    function getTaxModel(rate) {
      const value = clamp(Number(rate ?? 42), 0, 100);
      const intensity = value / 100;
      let key = 'normal';
      let name = '常规税收';
      if (value <= 28) {
        key = 'light';
        name = '轻税养民';
      } else if (value <= 58) {
        key = 'normal';
        name = '常规税收';
      } else if (value <= 82) {
        key = 'heavy';
        name = '重税筹军';
      } else {
        key = 'wartime';
        name = '战时征发';
      }
      return {
        key,
        name,
        rate: value,
        tax: 0.58 + intensity * 1.42,
        public: 3.4 - intensity * 9.6,
        order: 1.2 - intensity * 5.2,
        growth: 1.24 - intensity * 0.68,
        commerce: 1.12 - intensity * 0.56
      };
    }

    function getGrainModel(rate) {
      const value = clamp(Number(rate ?? 28), 0, 100);
      const intensity = value / 100;
      let key = 'market';
      let name = '平价收粮';
      if (value <= 30) {
        key = 'market';
        name = '平价收粮';
      } else if (value <= 58) {
        key = 'office';
        name = '官府征粮';
      } else if (value <= 84) {
        key = 'forced';
        name = '强征军粮';
      } else {
        key = 'forced';
        name = '战时搜粟';
      }
      return {
        key,
        name,
        rate: value,
        food: 0.9 + intensity * 0.86,
        public: 1.4 - intensity * 8.4,
        order: 0.8 - intensity * 5.4,
        moneyCost: Math.round((1 - intensity) * 160),
        growth: 1.18 - intensity * 0.58
      };
    }

    function normalizeCityPolicy(city) {
      city.taxRate = clamp(Number(city.taxRate ?? policyRateFromKey('tax', city.taxPolicy)), 0, 100);
      city.grainRate = clamp(Number(city.grainRate ?? policyRateFromKey('grain', city.grainPolicy)), 0, 100);
      city.taxPolicy = getTaxModel(city.taxRate).key;
      city.grainPolicy = getGrainModel(city.grainRate).key;
      return city;
    }

    function policyRateFromKey(domain, key) {
      if (domain === 'tax') {
        return { light: 20, normal: 42, heavy: 70, wartime: 92 }[key] ?? 42;
      }
      return { market: 24, office: 46, forced: 72, tuntian: 18 }[key] ?? 28;
    }

    const CITY_TYPE_BY_ID = {
      yecheng: 'capital',
      xuchang: 'capital',
      changan: 'capital',
      chengdu: 'capital',
      xiangyang: 'capital',
      jianye: 'capital',
      beiping: 'capital',
      guandu: 'pass',
      yangpingguan: 'pass',
      kuaiji: 'port',
      zhuyagang: 'port',
      chaisang: 'port',
      jiangxia: 'port',
      jiangling: 'port',
      liangzhou: 'region',
      xuzhou: 'region',
      peiguo: 'region',
      langya: 'region',
      yuexi: 'region',
      zhuti: 'region'
    };

    const CITY_BLUEPRINTS = {
      liyang: city('liyang', '黎阳', 'yuan', 'yuan', 739, 184, {
        level: 3, population: 116000, agriculture: 62, commerce: 46, recruitBase: 0.015, food: 3600, money: 760,
        defense: 38, publicSupport: 48, order: 54, morale: 58, strategic: 86, terrain: '黄河渡口', resource: '渡口',
        garrison: troops(1400, 280, 380, 20), neighbors: ['baima', 'yecheng', 'chenliu'], roads: ['baima', 'yecheng'], waters: ['baima']
      }),
      baima: city('baima', '白马', 'local', 'local', 786, 241, {
        level: 2, population: 78000, agriculture: 50, commerce: 35, recruitBase: 0.014, food: 2300, money: 380,
        defense: 28, publicSupport: 42, order: 44, morale: 45, strategic: 82, terrain: '黄河津口', resource: '渡口',
        garrison: troops(860, 80, 180, 0), neighbors: ['liyang', 'yanjin', 'dongjun'], roads: ['liyang', 'yanjin', 'dongjun'], waters: ['liyang', 'yanjin']
      }),
      yanjin: city('yanjin', '延津', 'local', 'local', 908, 241, {
        level: 2, population: 69000, agriculture: 47, commerce: 31, recruitBase: 0.013, food: 2100, money: 320,
        defense: 25, publicSupport: 43, order: 46, morale: 44, strategic: 74, terrain: '河岸险渡', resource: '津渡',
        garrison: troops(620, 70, 150, 0), neighbors: ['baima', 'guandu', 'pingyuan'], roads: ['baima', 'guandu'], waters: ['baima', 'guandu']
      }),
      guandu: city('guandu', '官渡', 'cao', 'cao', 807, 325, {
        level: 3, population: 82000, agriculture: 52, commerce: 50, recruitBase: 0.014, food: 3900, money: 860,
        defense: 66, publicSupport: 57, order: 61, morale: 65, strategic: 94, terrain: '中原咽喉', resource: '粮道',
        garrison: troops(1450, 240, 460, 40), neighbors: ['yanjin', 'xuchang', 'chenliu', 'puyang'], roads: ['yanjin', 'xuchang', 'chenliu', 'puyang'], waters: ['yanjin']
      }),
      yecheng: city('yecheng', '邺城', 'yuan', 'yuan', 850, 184, {
        level: 5, population: 230000, agriculture: 76, commerce: 78, recruitBase: 0.017, food: 9800, money: 2600,
        defense: 74, publicSupport: 67, order: 72, morale: 68, strategic: 100, terrain: '冀州本营', resource: '州府',
        garrison: troops(7600, 1300, 2100, 180), neighbors: ['liyang', 'nanpi', 'pingyuan'], roads: ['liyang', 'nanpi', 'pingyuan'], waters: []
      }),
      nanpi: city('nanpi', '南皮', 'yuan', 'yuan', 1010, 160, {
        level: 4, population: 165000, agriculture: 69, commerce: 54, recruitBase: 0.016, food: 6100, money: 1180,
        defense: 58, publicSupport: 60, order: 62, morale: 60, strategic: 80, terrain: '渤海门户', resource: '盐铁',
        garrison: troops(4700, 820, 1300, 80), neighbors: ['yecheng', 'pingyuan', 'beiping'], roads: ['yecheng', 'pingyuan', 'beiping'], waters: []
      }),
      pingyuan: city('pingyuan', '平原', 'local', 'local', 984, 200, {
        level: 3, population: 105000, agriculture: 63, commerce: 42, recruitBase: 0.014, food: 3400, money: 520,
        defense: 34, publicSupport: 50, order: 49, morale: 47, strategic: 76, terrain: '青冀通路', resource: '豪强',
        garrison: troops(880, 120, 240, 0), neighbors: ['yecheng', 'nanpi', 'yanjin', 'dongjun', 'yijing'], roads: ['yecheng', 'nanpi', 'yanjin', 'dongjun', 'yijing'], waters: []
      }),
      dongjun: city('dongjun', '东郡', 'local', 'local', 1078, 238, {
        level: 3, population: 118000, agriculture: 61, commerce: 47, recruitBase: 0.015, food: 3600, money: 650,
        defense: 36, publicSupport: 48, order: 46, morale: 50, strategic: 78, terrain: '黄河下游', resource: '粮仓',
        garrison: troops(1050, 110, 270, 0), neighbors: ['baima', 'pingyuan', 'puyang'], roads: ['baima', 'pingyuan', 'puyang'], waters: []
      }),
      puyang: city('puyang', '濮阳', 'cao', 'cao', 985, 340, {
        level: 4, population: 148000, agriculture: 65, commerce: 61, recruitBase: 0.016, food: 5400, money: 1300,
        defense: 52, publicSupport: 58, order: 60, morale: 62, strategic: 86, terrain: '兖州要冲', resource: '府库',
        garrison: troops(1850, 280, 540, 30), neighbors: ['dongjun', 'guandu', 'chenliu'], roads: ['dongjun', 'guandu', 'chenliu'], waters: []
      }),
      chenliu: city('chenliu', '陈留', 'cao', 'cao', 699, 329, {
        level: 4, population: 150000, agriculture: 68, commerce: 65, recruitBase: 0.016, food: 5600, money: 1350,
        defense: 49, publicSupport: 57, order: 58, morale: 61, strategic: 84, terrain: '中原粮道', resource: '商路',
        garrison: troops(1750, 230, 500, 20), neighbors: ['liyang', 'guandu', 'puyang', 'xuchang'], roads: ['liyang', 'guandu', 'puyang', 'xuchang'], waters: []
      }),
      xuchang: city('xuchang', '许昌', 'cao', 'cao', 795, 390, {
        level: 5, population: 220000, agriculture: 80, commerce: 82, recruitBase: 0.017, food: 9900, money: 2900,
        defense: 70, publicSupport: 66, order: 70, morale: 72, strategic: 98, terrain: '曹操根本', resource: '天子',
        garrison: troops(3600, 580, 900, 70), neighbors: ['guandu', 'chenliu', 'xiaopei'], roads: ['guandu', 'chenliu', 'xiaopei'], waters: []
      }),
      jinan: city('jinan', '济南', 'cao', 'cao', 975, 361, {
        level: 4, population: 142000, agriculture: 70, commerce: 58, recruitBase: 0.015, food: 5900, money: 1120,
        defense: 48, publicSupport: 57, order: 59, morale: 60, strategic: 76, terrain: '齐地粮仓', resource: '粮仓',
        resources: ['粮仓', '盐铁'], garrison: troops(1300, 160, 390, 20), neighbors: ['puyang', 'dongjun', 'langya', 'xuzhou'], roads: ['puyang', 'dongjun', 'langya', 'xuzhou'], waters: []
      }),
      runan: city('runan', '汝南', 'cao', 'cao', 745, 580, {
        level: 4, population: 168000, agriculture: 78, commerce: 52, recruitBase: 0.015, food: 7200, money: 980,
        defense: 42, publicSupport: 56, order: 54, morale: 57, strategic: 70, terrain: '豫州沃野', resource: '稻麦',
        resources: ['稻麦', '民户'], garrison: troops(1150, 100, 340, 10), neighbors: ['xuchang', 'qiao', 'peiguo', 'xinye'], roads: ['xuchang', 'qiao', 'peiguo', 'xinye'], waters: []
      }),
      qiao: city('qiao', '谯', 'cao', 'cao', 535, 474, {
        level: 3, population: 98000, agriculture: 61, commerce: 48, recruitBase: 0.015, food: 3600, money: 720,
        defense: 38, publicSupport: 55, order: 55, morale: 58, strategic: 66, terrain: '沛谯乡邑', resource: '宗族',
        resources: ['宗族', '商路'], garrison: troops(850, 90, 240, 0), neighbors: ['chenliu', 'xuchang', 'runan', 'peiguo'], roads: ['chenliu', 'xuchang', 'runan', 'peiguo'], waters: []
      }),
      peiguo: city('peiguo', '沛国', 'cao', 'cao', 824, 533, {
        level: 3, population: 112000, agriculture: 64, commerce: 46, recruitBase: 0.015, food: 4200, money: 760,
        defense: 40, publicSupport: 54, order: 53, morale: 56, strategic: 72, terrain: '豫徐交界', resource: '兵源',
        resources: ['兵源', '麦田'], garrison: troops(950, 110, 280, 0), neighbors: ['xuchang', 'xiaopei', 'pengcheng', 'runan', 'qiao'], roads: ['xuchang', 'xiaopei', 'pengcheng', 'runan'], waters: []
      }),
      xiaopei: city('xiaopei', '小沛', 'liu', 'liu', 976, 443, {
        level: 3, population: 92000, agriculture: 56, commerce: 38, recruitBase: 0.015, food: 3100, money: 460,
        defense: 35, publicSupport: 72, order: 60, morale: 75, strategic: 62, terrain: '徐州边城', resource: '名望',
        garrison: troops(950, 160, 230, 0), neighbors: ['xuchang', 'puyang'], roads: ['xuchang', 'puyang'], waters: []
      }),
      beiping: city('beiping', '北平', 'gongsun', 'gongsun', 1029, 102, {
        level: 4, population: 135000, agriculture: 54, commerce: 43, recruitBase: 0.018, food: 4200, money: 780,
        defense: 62, publicSupport: 58, order: 64, morale: 76, strategic: 78, terrain: '幽燕骑军', resource: '战马',
        garrison: troops(2300, 860, 260, 0), neighbors: ['yijing', 'nanpi'], roads: ['yijing', 'nanpi'], waters: []
      }),
      liaoxi: city('liaoxi', '辽西', 'gongsun', 'gongsun', 1126, 121, {
        level: 3, population: 76000, agriculture: 36, commerce: 34, recruitBase: 0.018, food: 2600, money: 520,
        defense: 50, publicSupport: 55, order: 57, morale: 70, strategic: 64, terrain: '辽西边郡', resource: '胡马',
        resources: ['胡马', '边骑'], garrison: troops(880, 560, 140, 0), neighbors: ['beiping', 'yijing'], roads: ['beiping', 'yijing'], waters: []
      }),
      yijing: city('yijing', '易京', 'gongsun', 'gongsun', 1162, 142, {
        level: 4, population: 118000, agriculture: 50, commerce: 41, recruitBase: 0.018, food: 3900, money: 700,
        defense: 68, publicSupport: 54, order: 58, morale: 71, strategic: 73, terrain: '坚城壁垒', resource: '骑军',
        garrison: troops(2100, 740, 280, 0), neighbors: ['beiping', 'pingyuan'], roads: ['beiping', 'pingyuan'], waters: []
      }),
      luoyang: city('luoyang', '洛阳', 'local', 'local', 640, 198, {
        level: 5, population: 170000, agriculture: 58, commerce: 74, recruitBase: 0.014, food: 5200, money: 1600,
        defense: 58, publicSupport: 44, order: 42, morale: 50, strategic: 92, terrain: '旧都废墟', resource: '帝都旧望',
        garrison: troops(1300, 180, 360, 20), neighbors: ['yanjin', 'changan', 'wancheng'], roads: ['yanjin', 'changan', 'wancheng'], waters: []
      }),
      changan: city('changan', '长安', 'local', 'local', 510, 300, {
        level: 5, population: 190000, agriculture: 66, commerce: 62, recruitBase: 0.015, food: 6300, money: 1500,
        defense: 72, publicSupport: 48, order: 47, morale: 54, strategic: 96, terrain: '关中重镇', resource: '关隘',
        garrison: troops(2100, 260, 520, 60), neighbors: ['luoyang', 'wuwei', 'tianshui', 'hanzhong'], roads: ['luoyang', 'wuwei', 'tianshui', 'hanzhong'], waters: []
      }),
      wuwei: city('wuwei', '武威', 'mateng', 'mateng', 337, 203, {
        level: 3, population: 90000, agriculture: 38, commerce: 40, recruitBase: 0.018, food: 2900, money: 620,
        defense: 50, publicSupport: 58, order: 52, morale: 72, strategic: 72, terrain: '凉州骑路', resource: '战马',
        garrison: troops(1050, 760, 160, 0), neighbors: ['changan', 'tianshui'], roads: ['changan', 'tianshui'], waters: []
      }),
      liangzhou: city('liangzhou', '凉州', 'mateng', 'mateng', 63, 280, {
        level: 3, population: 72000, agriculture: 34, commerce: 38, recruitBase: 0.019, food: 2400, money: 560,
        defense: 46, publicSupport: 55, order: 49, morale: 71, strategic: 70, terrain: '西凉边塞', resource: '战马',
        resources: ['战马', '羌骑'], garrison: troops(760, 620, 120, 0), neighbors: ['wuwei', 'zhangye', 'longxi'], roads: ['wuwei', 'zhangye', 'longxi'], waters: []
      }),
      zhangye: city('zhangye', '张掖', 'mateng', 'mateng', 114, 408, {
        level: 3, population: 68000, agriculture: 36, commerce: 46, recruitBase: 0.018, food: 2300, money: 720,
        defense: 44, publicSupport: 54, order: 50, morale: 68, strategic: 66, terrain: '河西商道', resource: '驼队',
        resources: ['驼队', '战马'], garrison: troops(680, 520, 120, 0), neighbors: ['liangzhou', 'jiuquan', 'longxi'], roads: ['liangzhou', 'jiuquan', 'longxi'], waters: []
      }),
      jiuquan: city('jiuquan', '酒泉', 'mateng', 'mateng', 294, 368, {
        level: 3, population: 62000, agriculture: 32, commerce: 48, recruitBase: 0.018, food: 2100, money: 760,
        defense: 42, publicSupport: 53, order: 50, morale: 66, strategic: 62, terrain: '河西远郡', resource: '玉门商旅',
        resources: ['玉门商旅', '边骑'], garrison: troops(620, 460, 110, 0), neighbors: ['zhangye', 'wuwei', 'longxi'], roads: ['zhangye', 'wuwei', 'longxi'], waters: []
      }),
      tianshui: city('tianshui', '天水', 'mateng', 'mateng', 438, 315, {
        level: 3, population: 82000, agriculture: 46, commerce: 34, recruitBase: 0.017, food: 2600, money: 440,
        defense: 46, publicSupport: 55, order: 52, morale: 68, strategic: 68, terrain: '陇右山道', resource: '羌骑',
        garrison: troops(920, 520, 150, 0), neighbors: ['wuwei', 'changan', 'hanzhong'], roads: ['wuwei', 'changan', 'hanzhong'], waters: []
      }),
      anding: city('anding', '安定', 'mateng', 'mateng', 286, 546, {
        level: 3, population: 74000, agriculture: 42, commerce: 34, recruitBase: 0.018, food: 2600, money: 460,
        defense: 54, publicSupport: 54, order: 51, morale: 69, strategic: 74, terrain: '陇上关塞', resource: '羌胡兵',
        resources: ['羌胡兵', '山道'], garrison: troops(800, 500, 150, 0), neighbors: ['longxi', 'jincheng', 'tianshui'], roads: ['longxi', 'jincheng', 'tianshui'], waters: []
      }),
      jincheng: city('jincheng', '金城', 'mateng', 'mateng', 436, 466, {
        level: 3, population: 80000, agriculture: 44, commerce: 40, recruitBase: 0.018, food: 2800, money: 560,
        defense: 50, publicSupport: 55, order: 52, morale: 70, strategic: 72, terrain: '湟水要地', resource: '铁骑',
        resources: ['铁骑', '边市'], garrison: troops(860, 540, 150, 0), neighbors: ['tianshui', 'anding', 'longxi'], roads: ['tianshui', 'anding', 'longxi'], waters: []
      }),
      longxi: city('longxi', '陇西', 'mateng', 'mateng', 191, 508, {
        level: 3, population: 78000, agriculture: 43, commerce: 36, recruitBase: 0.018, food: 2700, money: 500,
        defense: 48, publicSupport: 54, order: 50, morale: 68, strategic: 76, terrain: '陇西山原', resource: '牧场',
        resources: ['牧场', '山道'], garrison: troops(760, 500, 130, 0), neighbors: ['liangzhou', 'zhangye', 'anding', 'jincheng', 'tianshui'], roads: ['liangzhou', 'anding', 'jincheng', 'tianshui'], waters: []
      }),
      hanzhong: city('hanzhong', '汉中', 'zhanglu', 'zhanglu', 620, 478, {
        level: 4, population: 128000, agriculture: 62, commerce: 46, recruitBase: 0.014, food: 4800, money: 840,
        defense: 64, publicSupport: 63, order: 60, morale: 58, strategic: 84, terrain: '秦巴门户', resource: '米道',
        garrison: troops(1450, 120, 380, 20), neighbors: ['changan', 'tianshui', 'chengdu', 'xiangyang'], roads: ['changan', 'tianshui', 'chengdu', 'xiangyang'], waters: []
      }),
      yangpingguan: city('yangpingguan', '阳平关', 'zhanglu', 'zhanglu', 344, 635, {
        level: 3, population: 46000, agriculture: 32, commerce: 26, recruitBase: 0.014, food: 2100, money: 360,
        defense: 76, publicSupport: 59, order: 61, morale: 66, strategic: 92, terrain: '秦蜀险关', resource: '关隘',
        resources: ['关隘', '栈道'], garrison: troops(980, 60, 260, 30), neighbors: ['hanzhong', 'chengdu', 'zitong'], roads: ['hanzhong', 'chengdu', 'zitong'], waters: []
      }),
      chengdu: city('chengdu', '成都', 'liuzhang', 'liuzhang', 540, 600, {
        level: 5, population: 240000, agriculture: 86, commerce: 68, recruitBase: 0.014, food: 10800, money: 2100,
        defense: 62, publicSupport: 70, order: 66, morale: 56, strategic: 88, terrain: '益州腹地', resource: '沃野',
        garrison: troops(2400, 180, 620, 40), neighbors: ['hanzhong', 'jiangzhou'], roads: ['hanzhong', 'jiangzhou'], waters: []
      }),
      jiangzhou: city('jiangzhou', '江州', 'liuzhang', 'liuzhang', 650, 680, {
        level: 4, population: 150000, agriculture: 68, commerce: 52, recruitBase: 0.014, food: 6200, money: 980,
        defense: 48, publicSupport: 64, order: 60, morale: 55, strategic: 76, terrain: '巴蜀水道', resource: '盐井',
        garrison: troops(1300, 90, 360, 10), neighbors: ['chengdu', 'hanzhong', 'xiangyang', 'jiangling'], roads: ['chengdu', 'hanzhong', 'xiangyang', 'jiangling'], waters: ['jiangling']
      }),
      zitong: city('zitong', '梓潼', 'liuzhang', 'liuzhang', 405, 934, {
        level: 3, population: 92000, agriculture: 64, commerce: 38, recruitBase: 0.014, food: 4200, money: 560,
        defense: 48, publicSupport: 63, order: 58, morale: 54, strategic: 70, terrain: '蜀北粮道', resource: '粮仓',
        resources: ['粮仓', '蜀道'], garrison: troops(820, 70, 230, 0), neighbors: ['chengdu', 'yangpingguan', 'yongan', 'jiangzhou'], roads: ['chengdu', 'yangpingguan', 'yongan', 'jiangzhou'], waters: []
      }),
      yongan: city('yongan', '永安', 'liuzhang', 'liuzhang', 334, 868, {
        level: 3, population: 76000, agriculture: 58, commerce: 34, recruitBase: 0.014, food: 3600, money: 460,
        defense: 62, publicSupport: 61, order: 58, morale: 56, strategic: 78, terrain: '峡江门户', resource: '险峡',
        resources: ['险峡', '木材'], garrison: troops(900, 50, 260, 10), neighbors: ['jiangzhou', 'zitong', 'jianning'], roads: ['jiangzhou', 'zitong', 'jianning'], waters: ['jiangzhou']
      }),
      jianning: city('jianning', '建宁', 'liuzhang', 'liuzhang', 239, 955, {
        level: 3, population: 70000, agriculture: 56, commerce: 30, recruitBase: 0.013, food: 3300, money: 380,
        defense: 40, publicSupport: 56, order: 48, morale: 50, strategic: 54, terrain: '南中山郡', resource: '山货',
        resources: ['山货', '藤木'], garrison: troops(520, 30, 170, 0), neighbors: ['yongan', 'yunnan', 'yuexi', 'zhuti'], roads: ['yongan', 'yunnan', 'yuexi', 'zhuti'], waters: []
      }),
      yunnan: city('yunnan', '云南', 'liuzhang', 'liuzhang', 215, 1040, {
        level: 3, population: 66000, agriculture: 54, commerce: 32, recruitBase: 0.013, food: 3100, money: 420,
        defense: 38, publicSupport: 55, order: 47, morale: 50, strategic: 52, terrain: '南中高原', resource: '铜矿',
        resources: ['铜矿', '象道'], garrison: troops(500, 40, 150, 0), neighbors: ['jianning', 'yuexi', 'zhuti'], roads: ['jianning', 'yuexi', 'zhuti'], waters: []
      }),
      yuexi: city('yuexi', '越巂', 'liuzhang', 'liuzhang', 120, 1020, {
        level: 2, population: 48000, agriculture: 43, commerce: 24, recruitBase: 0.013, food: 2100, money: 260,
        defense: 34, publicSupport: 52, order: 44, morale: 48, strategic: 46, terrain: '西南山地', resource: '山民',
        resources: ['山民', '药材'], garrison: troops(360, 30, 110, 0), neighbors: ['jianning', 'yunnan', 'zhuti'], roads: ['jianning', 'yunnan', 'zhuti'], waters: []
      }),
      zhuti: city('zhuti', '朱提', 'liuzhang', 'liuzhang', 382, 1044, {
        level: 3, population: 62000, agriculture: 48, commerce: 36, recruitBase: 0.013, food: 2700, money: 520,
        defense: 42, publicSupport: 53, order: 46, morale: 49, strategic: 58, terrain: '朱提银路', resource: '银矿',
        resources: ['银矿', '山道'], garrison: troops(480, 35, 140, 0), neighbors: ['jianning', 'yunnan', 'yuexi', 'jiangling'], roads: ['jianning', 'yunnan', 'yuexi', 'jiangling'], waters: []
      }),
      wancheng: city('wancheng', '宛城', 'local', 'local', 690, 420, {
        level: 4, population: 140000, agriculture: 64, commerce: 57, recruitBase: 0.015, food: 5200, money: 1050,
        defense: 48, publicSupport: 50, order: 48, morale: 52, strategic: 88, terrain: '南阳门户', resource: '铁器',
        garrison: troops(1350, 170, 420, 20), neighbors: ['luoyang', 'xuchang', 'xiangyang', 'jiangling'], roads: ['luoyang', 'xuchang', 'xiangyang', 'jiangling'], waters: []
      }),
      xinye: city('xinye', '新野', 'liu', 'liu', 886, 709, {
        level: 3, population: 86000, agriculture: 58, commerce: 37, recruitBase: 0.015, food: 3300, money: 480,
        defense: 38, publicSupport: 70, order: 58, morale: 72, strategic: 68, terrain: '荆北客军', resource: '仁望',
        resources: ['仁望', '民兵'], garrison: troops(780, 120, 210, 0), neighbors: ['runan', 'xuchang', 'xiangyang', 'jiangxia'], roads: ['runan', 'xuchang', 'xiangyang', 'jiangxia'], waters: []
      }),
      xiangyang: city('xiangyang', '襄阳', 'liubiao', 'liubiao', 818, 585, {
        level: 5, population: 210000, agriculture: 72, commerce: 70, recruitBase: 0.015, food: 7800, money: 1900,
        defense: 74, publicSupport: 66, order: 68, morale: 64, strategic: 95, terrain: '荆襄锁钥', resource: '水军',
        garrison: troops(2600, 200, 720, 50), neighbors: ['wancheng', 'hanzhong', 'jiangzhou', 'jiangling', 'jiangxia'], roads: ['wancheng', 'hanzhong', 'jiangling', 'jiangxia'], waters: ['jiangling', 'jiangxia']
      }),
      jiangling: city('jiangling', '江陵', 'liubiao', 'liubiao', 760, 670, {
        level: 4, population: 155000, agriculture: 70, commerce: 58, recruitBase: 0.014, food: 6100, money: 1150,
        defense: 56, publicSupport: 62, order: 60, morale: 60, strategic: 82, terrain: '江汉粮仓', resource: '江港',
        garrison: troops(1500, 110, 430, 20), neighbors: ['xiangyang', 'jiangzhou', 'jiangxia', 'changsha'], roads: ['xiangyang', 'jiangzhou', 'jiangxia', 'changsha'], waters: ['xiangyang', 'jiangxia']
      }),
      jiangxia: city('jiangxia', '江夏', 'liubiao', 'liubiao', 900, 635, {
        level: 4, population: 145000, agriculture: 63, commerce: 60, recruitBase: 0.014, food: 5400, money: 1240,
        defense: 52, publicSupport: 58, order: 58, morale: 58, strategic: 86, terrain: '长江要渡', resource: '水寨',
        garrison: troops(1450, 90, 480, 20), neighbors: ['xiangyang', 'jiangling', 'shouchun', 'lujiang', 'changsha'], roads: ['xiangyang', 'jiangling', 'shouchun', 'lujiang', 'changsha'], waters: ['jiangling', 'lujiang']
      }),
      changsha: city('changsha', '长沙', 'liubiao', 'liubiao', 920, 820, {
        level: 4, population: 160000, agriculture: 72, commerce: 50, recruitBase: 0.014, food: 6600, money: 900,
        defense: 42, publicSupport: 63, order: 56, morale: 54, strategic: 68, terrain: '湘水平原', resource: '稻米',
        garrison: troops(1100, 80, 330, 0), neighbors: ['jiangling', 'jiangxia', 'guiyang', 'chaisang'], roads: ['jiangling', 'jiangxia', 'guiyang', 'chaisang'], waters: ['jiangxia', 'chaisang']
      }),
      // lingling 已删除，详见 REMOVED_CITY_IDS
      guiyang: city('guiyang', '桂阳', 'liubiao', 'player', 815, 970, {
        level: 3, population: 84000, agriculture: 56, commerce: 30, recruitBase: 0.013, food: 3600, money: 420,
        defense: 38, publicSupport: 56, order: 48, morale: 52, strategic: 68, terrain: '荆南山地 / 郡县门户', resource: '山地、粮田、地方豪强',
        resources: ['山地', '粮田', '地方豪强'], garrison: troops(560, 35, 160, 0),
        neighbors: ['changsha', 'yuzhang'], roads: ['changsha', 'yuzhang'], waters: []
      }),
      shouchun: city('shouchun', '寿春', 'yuanshu', 'yuanshu', 1030, 535, {
        level: 5, population: 190000, agriculture: 72, commerce: 66, recruitBase: 0.015, food: 7200, money: 1700,
        defense: 60, publicSupport: 43, order: 42, morale: 48, strategic: 90, terrain: '淮南重城', resource: '府库',
        garrison: troops(2200, 210, 600, 50), neighbors: ['xiaopei', 'xuzhou', 'jiangxia', 'lujiang'], roads: ['xiaopei', 'xuzhou', 'jiangxia', 'lujiang'], waters: ['lujiang']
      }),
      xuzhou: city('xuzhou', '徐州', 'liu', 'liu', 1082, 455, {
        level: 4, population: 155000, agriculture: 66, commerce: 58, recruitBase: 0.015, food: 5700, money: 1180,
        defense: 46, publicSupport: 68, order: 58, morale: 66, strategic: 80, terrain: '徐州州治', resource: '名士',
        garrison: troops(1300, 160, 410, 10), neighbors: ['xiaopei', 'xiapi', 'shouchun'], roads: ['xiaopei', 'xiapi', 'shouchun'], waters: []
      }),
      xiapi: city('xiapi', '下邳', 'liu', 'liu', 1140, 450, {
        level: 4, population: 130000, agriculture: 62, commerce: 50, recruitBase: 0.014, food: 4900, money: 880,
        defense: 52, publicSupport: 62, order: 54, morale: 58, strategic: 72, terrain: '泗水要地', resource: '水网',
        garrison: troops(1100, 110, 330, 10), neighbors: ['xuzhou', 'shouchun', 'jianye'], roads: ['xuzhou', 'shouchun', 'jianye'], waters: ['jianye']
      }),
      langya: city('langya', '琅邪', 'liu', 'liu', 1155, 546, {
        level: 3, population: 96000, agriculture: 56, commerce: 44, recruitBase: 0.014, food: 3400, money: 620,
        defense: 36, publicSupport: 64, order: 55, morale: 58, strategic: 60, terrain: '海岱郡望', resource: '士族',
        resources: ['士族', '海盐'], garrison: troops(720, 80, 230, 0), neighbors: ['jinan', 'xuzhou', 'pengcheng'], roads: ['jinan', 'xuzhou', 'pengcheng'], waters: []
      }),
      pengcheng: city('pengcheng', '彭城', 'liu', 'liu', 1095, 579, {
        level: 4, population: 125000, agriculture: 62, commerce: 52, recruitBase: 0.015, food: 4600, money: 860,
        defense: 44, publicSupport: 66, order: 56, morale: 62, strategic: 74, terrain: '徐州腹地', resource: '兵家旧地',
        resources: ['兵家旧地', '麦田'], garrison: troops(980, 120, 300, 10), neighbors: ['peiguo', 'xiaopei', 'xuzhou', 'langya'], roads: ['peiguo', 'xiaopei', 'xuzhou', 'langya'], waters: []
      }),
      hefei: city('hefei', '合肥', 'sun', 'sun', 1072, 913, {
        level: 4, population: 132000, agriculture: 62, commerce: 60, recruitBase: 0.014, food: 5000, money: 1120,
        defense: 58, publicSupport: 60, order: 58, morale: 62, strategic: 88, terrain: '江淮要塞', resource: '合肥新城',
        resources: ['合肥新城', '水网'], garrison: troops(1500, 90, 470, 30), neighbors: ['lujiang', 'chaisang', 'yuzhang', 'jiangxia'], roads: ['lujiang', 'chaisang', 'yuzhang', 'jiangxia'], waters: ['lujiang', 'chaisang']
      }),
      lujiang: city('lujiang', '庐江', 'sun', 'sun', 1095, 640, {
        level: 4, population: 128000, agriculture: 61, commerce: 56, recruitBase: 0.014, food: 5000, money: 960,
        defense: 46, publicSupport: 59, order: 57, morale: 60, strategic: 78, terrain: '江淮门户', resource: '铜铁',
        garrison: troops(1200, 90, 380, 10), neighbors: ['shouchun', 'jiangxia', 'jianye', 'chaisang'], roads: ['shouchun', 'jiangxia', 'jianye', 'chaisang'], waters: ['jiangxia', 'jianye']
      }),
      jianye: city('jianye', '建业', 'sun', 'sun', 1210, 620, {
        level: 5, population: 210000, agriculture: 70, commerce: 78, recruitBase: 0.014, food: 7600, money: 2200,
        defense: 58, publicSupport: 66, order: 65, morale: 64, strategic: 92, terrain: '江东根本', resource: '水军',
        garrison: troops(2500, 140, 760, 60), neighbors: ['lujiang', 'xiapi', 'wujun'], roads: ['lujiang', 'xiapi', 'wujun'], waters: ['lujiang', 'wujun']
      }),
      wujun: city('wujun', '吴郡', 'sun', 'sun', 1295, 705, {
        level: 4, population: 170000, agriculture: 68, commerce: 72, recruitBase: 0.014, food: 6500, money: 1760,
        defense: 44, publicSupport: 68, order: 62, morale: 60, strategic: 74, terrain: '江东水乡', resource: '商港',
        garrison: troops(1300, 80, 430, 20), neighbors: ['jianye', 'kuaiji'], roads: ['jianye', 'kuaiji'], waters: ['jianye', 'kuaiji']
      }),
      kuaiji: city('kuaiji', '会稽', 'sun', 'sun', 1215, 835, {
        level: 4, population: 150000, agriculture: 64, commerce: 58, recruitBase: 0.013, food: 5600, money: 1100,
        defense: 40, publicSupport: 64, order: 60, morale: 56, strategic: 66, terrain: '东南海郡', resource: '海盐',
        garrison: troops(1000, 60, 320, 10), neighbors: ['wujun', 'chaisang'], roads: ['wujun', 'chaisang'], waters: ['wujun']
      }),
      chaisang: city('chaisang', '柴桑', 'sun', 'sun', 1070, 760, {
        level: 4, population: 120000, agriculture: 58, commerce: 54, recruitBase: 0.014, food: 4600, money: 940,
        defense: 48, publicSupport: 60, order: 58, morale: 60, strategic: 82, terrain: '江上军港', resource: '水寨',
        garrison: troops(1300, 70, 420, 20), neighbors: ['lujiang', 'changsha', 'kuaiji'], roads: ['lujiang', 'changsha', 'kuaiji'], waters: ['lujiang', 'changsha', 'kuaiji']
      }),
      yuzhang: city('yuzhang', '豫章', 'sun', 'sun', 1065, 1014, {
        level: 4, population: 138000, agriculture: 66, commerce: 58, recruitBase: 0.014, food: 5600, money: 1080,
        defense: 42, publicSupport: 61, order: 58, morale: 58, strategic: 72, terrain: '赣水腹地', resource: '铜铁',
        resources: ['铜铁', '稻米'], garrison: troops(980, 60, 320, 10), neighbors: ['chaisang', 'hefei', 'guiyang', 'zhuyagang'], roads: ['chaisang', 'hefei', 'guiyang', 'zhuyagang'], waters: ['chaisang', 'zhuyagang']
      }),
      zhuyagang: city('zhuyagang', '朱崖港', 'sun', 'sun', 1204, 1022, {
        level: 2, population: 42000, agriculture: 32, commerce: 50, recruitBase: 0.012, food: 1600, money: 620,
        defense: 28, publicSupport: 58, order: 52, morale: 50, strategic: 58, terrain: '南海港口', resource: '远海商路',
        resources: ['远海商路', '海盐'], garrison: troops(260, 20, 90, 0), neighbors: ['yuzhang', 'kuaiji'], roads: ['yuzhang', 'kuaiji'], waters: ['yuzhang', 'kuaiji']
      })
    };

    const ROUTES = [
      ['liyang', 'baima'], ['baima', 'yanjin'], ['yanjin', 'guandu'], ['guandu', 'xuchang'],
      ['liyang', 'yecheng'], ['yecheng', 'nanpi'], ['nanpi', 'beiping'], ['beiping', 'yijing'],
      ['nanpi', 'pingyuan'], ['pingyuan', 'yijing'], ['pingyuan', 'yanjin'], ['pingyuan', 'dongjun'],
      ['baima', 'dongjun'], ['dongjun', 'puyang'], ['puyang', 'guandu'], ['puyang', 'chenliu'],
      ['chenliu', 'guandu'], ['chenliu', 'xuchang'], ['xuchang', 'xiaopei'], ['puyang', 'xiaopei'],
      ['liyang', 'chenliu'], ['yecheng', 'pingyuan'],
      ['yanjin', 'luoyang'], ['luoyang', 'changan'], ['luoyang', 'wancheng'],
      ['changan', 'wuwei'], ['changan', 'tianshui'], ['changan', 'hanzhong'], ['wuwei', 'tianshui'],
      ['tianshui', 'hanzhong'], ['hanzhong', 'chengdu'], ['hanzhong', 'xiangyang'],
      ['chengdu', 'jiangzhou'], ['jiangzhou', 'jiangling'], ['jiangzhou', 'xiangyang'],
      ['xuchang', 'wancheng'], ['wancheng', 'xiangyang'], ['wancheng', 'jiangling'],
      ['xiangyang', 'jiangling'], ['xiangyang', 'jiangxia'], ['jiangling', 'jiangxia'], ['jiangling', 'changsha'],
      ['jiangxia', 'shouchun'], ['jiangxia', 'lujiang'], ['jiangxia', 'changsha'],
      ['changsha', 'guiyang'], ['changsha', 'chaisang'],
      ['xiaopei', 'xuzhou'], ['xuzhou', 'xiapi'], ['xuzhou', 'shouchun'], ['xiapi', 'jianye'],
      ['shouchun', 'lujiang'], ['lujiang', 'jianye'], ['lujiang', 'chaisang'],
      ['jianye', 'wujun'], ['wujun', 'kuaiji'], ['kuaiji', 'chaisang']
    ];

    const WATER_ROUTES = [['liyang', 'baima'], ['baima', 'yanjin'], ['yanjin', 'guandu']];

    ensureRoutePair(ROUTES, 'changsha', 'guiyang');
    ensureRoutePair(ROUTES, 'guiyang', 'yuzhang');

    const MAP_DETAILS = [
      { id: 'liyang_granary', city: 'liyang', name: '黎阳仓', type: '粮', x: 710, y: 206, minZoom: 1.35, note: '军粮节点' },
      { id: 'liyang_camp', city: 'liyang', name: '黎阳军营', type: '营', x: 758, y: 169, minZoom: 1.9, note: '驻军营地' },
      { id: 'baima_ford', city: 'baima', name: '白马津', type: '渡', x: 761, y: 263, minZoom: 1.25, note: '黄河渡线' },
      { id: 'yanjin_ford', city: 'yanjin', name: '延津渡', type: '渡', x: 931, y: 266, minZoom: 1.35, note: '水路风险' },
      { id: 'guandu_store', city: 'guandu', name: '官渡粮台', type: '粮', x: 832, y: 346, minZoom: 1.45, note: '曹军粮道' },
      { id: 'yecheng_palace', city: 'yecheng', name: '袁府内门', type: '门', x: 872, y: 162, minZoom: 2.2, note: '逼宫关键' },
      { id: 'yecheng_arsenal', city: 'yecheng', name: '邺城武库', type: '械', x: 820, y: 210, minZoom: 1.9, note: '守军器械' },
      { id: 'pingyuan_clan', city: 'pingyuan', name: '平原士族', type: '族', x: 1005, y: 224, minZoom: 1.7, note: '可拉拢' },
      { id: 'dongjun_store', city: 'dongjun', name: '东郡粮仓', type: '粮', x: 1105, y: 260, minZoom: 1.55, note: '扩张目标' },
      { id: 'chenliu_market', city: 'chenliu', name: '陈留商路', type: '市', x: 728, y: 350, minZoom: 1.6, note: '高税收' },
      { id: 'puyang_gate', city: 'puyang', name: '濮阳东门', type: '门', x: 1015, y: 362, minZoom: 1.9, note: '可内应' },
      { id: 'xuchang_court', city: 'xuchang', name: '许昌朝廷', type: '廷', x: 770, y: 415, minZoom: 1.8, note: '曹操根本' },
      { id: 'xiaopei_oath', city: 'xiaopei', name: '小沛义军', type: '义', x: 1001, y: 463, minZoom: 1.75, note: '刘备名望' },
      { id: 'beiping_horse', city: 'beiping', name: '北平马场', type: '马', x: 1060, y: 84, minZoom: 1.55, note: '骑军来源' },
      { id: 'yijing_wall', city: 'yijing', name: '易京壁垒', type: '垒', x: 1186, y: 164, minZoom: 1.55, note: '坚城' },
      { id: 'nanpi_salt', city: 'nanpi', name: '南皮盐铁', type: '盐', x: 1035, y: 184, minZoom: 1.55, note: '府库收入' },
      { id: 'river_patrol', city: 'liyang', name: '黄河巡哨', type: '哨', x: 828, y: 286, minZoom: 2.45, note: '截击预警' },
      { id: 'baima_village', city: 'baima', name: '白马外郭', type: '邑', x: 808, y: 223, minZoom: 2.65, note: '民心影响' },
      { id: 'liyang_farmland', city: 'liyang', name: '黎阳屯田', type: '田', x: 704, y: 166, minZoom: 2.8, note: '长期粮产' },
      { id: 'guandu_crossroad', city: 'guandu', name: '官道岔口', type: '路', x: 780, y: 300, minZoom: 2.35, note: '伏击点' },
      { id: 'yecheng_barracks', city: 'yecheng', name: '北营兵册', type: '册', x: 892, y: 204, minZoom: 2.75, note: '刺探目标' },
      { id: 'yanjin_reed', city: 'yanjin', name: '芦苇浅滩', type: '滩', x: 886, y: 270, minZoom: 2.7, note: '夜袭路线' }
    ];

    const ROUTE_DETAILS = [
      { from: 'liyang', to: 'baima', name: '黄河渡线', risk: '截击低', minZoom: 1.45 },
      { from: 'baima', to: 'yanjin', name: '白马-延津水陆线', risk: '补给紧', minZoom: 1.65 },
      { from: 'yanjin', to: 'guandu', name: '官渡前线', risk: '曹军斥候', minZoom: 1.65 },
      { from: 'liyang', to: 'yecheng', name: '入邺官道', risk: '袁绍耳目', minZoom: 1.7 },
      { from: 'pingyuan', to: 'nanpi', name: '渤海南道', risk: '旧臣盘查', minZoom: 1.9 },
      { from: 'chenliu', to: 'guandu', name: '兖州粮道', risk: '重兵护送', minZoom: 1.9 }
    ];

    const STORY_REGIONS = {
      north: {
        label: '北方战区开放',
        visibleActs: [1, 2, 3],
        rects: [
          { x: 0, y: 0, width: 520, height: 1086 },
          { x: 520, y: 520, width: 928, height: 566 }
        ],
        band: 'M520 45 L520 520 L1448 520'
      },
      central: {
        label: '中原战区',
        visibleActs: [2, 3],
        rects: [
          { x: 0, y: 0, width: 520, height: 1086 },
          { x: 520, y: 690, width: 420, height: 396 },
          { x: 1090, y: 570, width: 358, height: 516 }
        ],
        band: 'M520 690 L940 690 M1090 570 L1090 1086'
      },
      world: {
        label: '天下棋局未开',
        visibleActs: [3],
        rects: [],
        band: ''
      }
    };

    const FUTURE_CAMPAIGN_NODES = [
      { act: 2, x: 580, y: 760, label: '关中余波' },
      { act: 2, x: 820, y: 570, label: '荆州变局' },
      { act: 3, x: 1150, y: 690, label: '江东战线' },
      { act: 3, x: 610, y: 610, label: '入蜀路线' },
      { act: 3, x: 1260, y: 825, label: '会稽海防' }
    ];

    function polygonToString(points) {
      return (points || []).map(point => point.map(value => Number(value).toFixed(2).replace(/\.?0+$/, '')).join(',')).join(' ');
    }

    const TROOP_KINDS = ['infantry', 'cavalry', 'archers', 'siege', 'navy'];
    const SPECIAL_TRAINING_ACTIONS = {
      trainLand: { type: 'land', label: '练陆兵', troopLabel: '陆兵', troopKind: 'infantry', effectKey: 'land', food: 0.38, money: 0.12, baseRate: 0.34 },
      trainCavalry: { type: 'cavalry', label: '练骑兵', troopLabel: '骑兵', troopKind: 'cavalry', effectKey: 'cavalry', food: 0.52, money: 0.36, baseRate: 0.18 },
      trainNavy: { type: 'navy', label: '练水兵', troopLabel: '水兵', troopKind: 'navy', effectKey: 'navy', food: 0.44, money: 0.24, baseRate: 0.2 }
    };
    const MILITARY_PREP_MODE_LIST = ['drill', 'defense', 'reserve'];

    function troops(infantry, cavalry, archers, siege, navy = 0) {
      return { infantry, cavalry, archers, siege, navy };
    }

    function stripHtmlTags(value) {
      return String(value).replace(/<[^>]*>/g, '');
    }

    function sanitizeLoadedData(obj, depth) {
      if (depth === undefined) depth = 0;
      if (depth > 50 || obj === null || obj === undefined) return true;
      if (typeof obj === 'string') {
        if (obj.length > 200000) return false;
        if (/<script|<img|onerror\s*=|javascript\s*:/i.test(obj)) return false;
        return true;
      }
      if (typeof obj === 'number') {
        if (!Number.isFinite(obj)) return false;
        return true;
      }
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (!sanitizeLoadedData(obj[i], depth + 1)) return false;
        }
        return true;
      }
      if (typeof obj === 'object') {
        // 额外清洗对象中的字符串字段
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (typeof val === 'string') {
            if (val.length > 200000) return false;
            if (/<script|<img|onerror\s*=|javascript\s*:/i.test(val)) return false;
            obj[key] = stripHtmlTags(val);
          } else if (typeof val === 'number' && !Number.isFinite(val)) {
            return false;
          } else if (typeof val === 'object') {
            if (!sanitizeLoadedData(val, depth + 1)) return false;
          }
        }
        return true;
      }
      return true;
    }

    function validateMapEditorSchema(saved) {
      if (!saved || typeof saved !== 'object') return false;
      if (!saved.regions || typeof saved.regions !== 'object') return false;
      for (const [id, region] of Object.entries(saved.regions)) {
        if (!region || typeof region !== 'object') return false;
        // 校验 center 坐标范围
        if (region.center) {
          const cx = Number(region.center.x), cy = Number(region.center.y);
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return false;
          if (Math.abs(cx) > 5000 || Math.abs(cy) > 5000) return false;
        }
        // 校验 polygon 坐标范围
        if (Array.isArray(region.polygon)) {
          for (const pt of region.polygon) {
            if (!Array.isArray(pt) || pt.length < 2) return false;
            const px = Number(pt[0]), py = Number(pt[1]);
            if (!Number.isFinite(px) || !Number.isFinite(py)) return false;
            if (Math.abs(px) > 5000 || Math.abs(py) > 5000) return false;
          }
        }
        // 过滤名称/标签字段中的 HTML 标签
        if (typeof region.name === 'string') region.name = stripHtmlTags(region.name);
        if (Array.isArray(region.resources)) region.resources = region.resources.map(stripHtmlTags);
      }
      return true;
    }

    function normalizeManualPolygon(polygon) {
      if (!Array.isArray(polygon)) return [];
      return polygon
        .map(point => {
          if (!Array.isArray(point) || point.length < 2) return null;
          const x = Number(point[0]);
          const y = Number(point[1]);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
          return [x, y];
        })
        .filter(Boolean);
    }

    function normalizeManualCenter(center) {
      const x = Number(center && center.x);
      const y = Number(center && center.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    }

    function normalizeManualRegion(region, id) {
      if (!region || typeof region !== 'object') return null;
      const center = normalizeManualCenter(region.center);
      const polygon = normalizeManualPolygon(region.polygon);
      if (!center || polygon.length < 3) return null;
      return {
        id,
        name: stripHtmlTags(region.name) || (CITY_BLUEPRINTS[id] && CITY_BLUEPRINTS[id].name) || id,
        type: 'cityRegion',
        center,
        polygon,
        completed: region.completed === true,
        nominalOwner: typeof region.nominalOwner === 'string' ? region.nominalOwner : undefined,
        controller: typeof region.controller === 'string' ? region.controller : undefined,
        population: Number(region.population || 0),
        agriculture: Number(region.agriculture || 0),
        commerce: Number(region.commerce || 0),
        manpower: Number(region.manpower || 0),
        foodStock: Number(region.foodStock || 0),
        treasury: Number(region.treasury || 0),
        publicSupport: Number(region.publicSupport || 50),
        publicOrder: Number(region.publicOrder || 50),
        defense: Number(region.defense || 0),
        morale: Number(region.morale || 50),
        garrison: Array.isArray(region.garrison) ? structuredClone(region.garrison) : [],
        resources: Array.isArray(region.resources) ? region.resources.map(stripHtmlTags) : [],
        neighbors: Array.isArray(region.neighbors) ? region.neighbors.map(stripHtmlTags) : []
      };
    }

    function hasMarkedPolygon(region) {
      return !!region && Array.isArray(region.polygon) && region.polygon.length >= 3;
    }

    function visibleRegions() {
      return Object.values(mapData?.regions || {}).filter(hasMarkedPolygon);
    }

    function readManualMapRegions() {
      let saved = null;
      if (window.MANUAL_MAP_DATA && window.MANUAL_MAP_DATA.regions) {
        saved = window.MANUAL_MAP_DATA;
      } else {
        try {
          saved = JSON.parse(localStorage.getItem(MAP_EDITOR_STORAGE_KEY) || 'null');
          if (saved && !validateMapEditorSchema(saved)) {
            console.warn('地图编辑器数据 schema 验证失败，已丢弃');
            saved = null;
          }
        } catch (error) {
          saved = null;
        }
      }
      const sourceRegions = saved && saved.regions && typeof saved.regions === 'object'
        ? saved.regions
        : {};
      const regions = {};
      Object.entries(sourceRegions).forEach(([id, sourceRegion]) => {
        const region = normalizeManualRegion(sourceRegion, id);
        if (region) regions[id] = region;
      });
      if (regions.liyang) {
        regions.liyang.nominalOwner = 'yuan';
        regions.liyang.controller = 'yuan';
      }
      if (regions.guiyang) {
        regions.guiyang.nominalOwner = 'liubiao';
        regions.guiyang.controller = 'player';
      }
      return Object.keys(regions).length ? regions : null;
    }

    let manualMapRegions = null;

    function getManualMapRegions() {
      if (!manualMapRegions) {
        manualMapRegions = readManualMapRegions();
      }
      return manualMapRegions;
    }

    function city(id, name, owner, actual, x, y, data = {}) {
      const recruitBase = Number(data.recruitBase ?? 0.014);
      const population = Number(data.population ?? 0);
      const primaryResource = data.resource || '无';
      const resources = Array.from(new Set((data.resources || []).concat(primaryResource))).filter(Boolean);
      return Object.assign({
        id,
        name,
        type: data.type || CITY_TYPE_BY_ID[id] || 'city',
        faction: data.faction || actual || owner,
        nominalOwner: data.nominalOwner || owner,
        controller: data.controller || actual || owner,
        owner,
        actual,
        x,
        y,
        level: data.level || 1,
        population,
        agriculture: data.agriculture || 0,
        commerce: data.commerce || 0,
        manpower: data.manpower || Math.round(population * recruitBase),
        recruitBase,
        food: data.food || 0,
        money: data.money || 0,
        defense: data.defense || 0,
        publicSupport: data.publicSupport ?? 50,
        order: data.order ?? 50,
        morale: data.morale ?? 50,
        strategic: data.strategic || 0,
        terrain: data.terrain || '未设定',
        resource: primaryResource,
        resources,
        garrison: data.garrison || troops(0, 0, 0, 0),
        neighbors: data.neighbors || [],
        roads: data.roads || [],
        waters: data.waters || [],
        taxPolicy: data.taxPolicy || 'normal',
        grainPolicy: data.grainPolicy || 'market',
        taxRate: data.taxRate ?? 42,
        grainRate: data.grainRate ?? 28,
        unlockChapter: data.unlockChapter || 1,
        isActive: data.isActive ?? true,
        construction: '无',
        front: false,
        intel: 0,
        disrupted: 0,
        warDamage: 0,
        warLevyStreak: 0,
        domain: data.level >= 5 ? 72 : data.level >= 4 ? 62 : data.level >= 3 ? 52 : 42
      }, data);
    }

    function stableHash(value) {
      return String(value || '').split('').reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 7);
    }

    const FACTION_GOVERNANCE_PROFILES = {
      player: { virtue: 66, order: 64 },
      liu: { virtue: 86, order: 70 },
      liubiao: { virtue: 78, order: 72 },
      liuzhang: { virtue: 76, order: 58 },
      zhanglu: { virtue: 80, order: 66 },
      sun: { virtue: 72, order: 74 },
      cao: { virtue: 60, order: 86 },
      yuan: { virtue: 58, order: 62 },
      gongsun: { virtue: 54, order: 66 },
      mateng: { virtue: 58, order: 64 },
      yuanshu: { virtue: 32, order: 42 },
      local: { virtue: 52, order: 45 }
    };

    function factionGovernanceProfile(factionId) {
      const fallback = FACTION_GOVERNANCE_PROFILES[factionId] || FACTION_GOVERNANCE_PROFILES.local;
      const lord = (typeof gameState !== 'undefined' && typeof getLordCharacterByFaction === 'function') ? getLordCharacterByFaction(factionId) : null;
      if (!lord) return fallback;
      const stats = lord.stats || {};
      const personality = lord.personality || {};
      const virtue = clamp(
        Number(stats.charm || fallback.virtue) * 0.42 +
        Number(stats.politics || fallback.virtue) * 0.34 +
        Number(personality.idealistic || 44) * 0.18 -
        Number(personality.ruthless || 28) * 0.12 -
        Number(personality.greedy || 28) * 0.08 +
        10,
        20,
        92
      );
      const order = clamp(
        Number(stats.politics || fallback.order) * 0.42 +
        Number(stats.command || fallback.order) * 0.24 +
        Number(stats.strategy || fallback.order) * 0.18 +
        Number(personality.cautious || 48) * 0.08 +
        Number(personality.ruthless || 28) * 0.06,
        20,
        92
      );
      return { virtue, order };
    }

    function cityHasMajorDisruption(city, eco = null) {
      return Boolean(
        Number(city?.warDamage || 0) >= 25 ||
        Number(city?.taxRate || 0) >= 82 ||
        Number(city?.grainRate || 0) >= 82 ||
        (eco && eco.foodProduction < eco.foodConsumption) ||
        (typeof gameState !== 'undefined' && city?.id && activeCampaignsTargetingCity(city.id).length > 0)
      );
    }

    function publicSupportGovernanceTarget(city, eco = null, controllerOverride = null) {
      const controller = controllerOverride || ((typeof gameState !== 'undefined' && city?.id)
        ? cityController(city.id)
        : (city?.actual || city?.controller || city?.owner || 'local'));
      const profile = factionGovernanceProfile(controller);
      const resourceBonus = cityResourcePublicSupportBonus(city || {});
      let target = 56 + (Number(profile.virtue || 50) - 50) * 0.48 + (Number(profile.order || 50) - 50) * 0.14 + resourceBonus * 0.45;
      if (controller === 'player') target += clamp(Number(gameState?.player?.legitimacy || 0) / 18, 0, 5);
      if (cityHasMajorDisruption(city, eco)) {
        target -= clamp(Number(city?.warDamage || 0) / 7, 0, 11);
        if (Number(city?.taxRate || 0) >= 82 || Number(city?.grainRate || 0) >= 82) target -= 7;
        if (eco && eco.foodProduction < eco.foodConsumption) target -= 6;
      } else {
        target = Math.max(target, 60);
      }
      return clamp(Math.round(target), cityHasMajorDisruption(city, eco) ? 28 : 60, 88);
    }

    function factionPublicSupportBonus(factionId) {
      const table = { liu: 9, liubiao: 5, sun: 3, cao: 0, yuan: -2, yuanshu: -8, gongsun: -1, liuzhang: 2, zhanglu: -1, mateng: -2, local: -1, player: 4 };
      return table[factionId] || 0;
    }

    function characterPublicSupportBonus(cityId) {
      const table = { liuBei: 14, liuBiao: 12, sunQuan: 5, caoCao: 1, yuanShao: -1 };
      return Object.values(CHARACTER_BLUEPRINTS || {}).reduce((bonus, character) => {
        const location = character.location || (character.id === 'liuBiao' ? 'xiangyang' : '');
        return bonus + (location === cityId ? (table[character.id] || 0) : 0);
      }, 0);
    }

    function cityResourcePublicSupportBonus(city) {
      const resources = [city.resource, city.terrain].concat(city.resources || []).filter(Boolean).join('、');
      let bonus = 0;
      if (/名士|名望|仁望/.test(resources)) bonus += 5;
      if (/宗族|士族/.test(resources)) bonus += 4;
      if (/稻米|稻麦|粮仓|粮田|沃野/.test(resources)) bonus += 3;
      if (/府库/.test(resources)) bonus += 1;
      if (/豪强/.test(resources)) bonus -= 3;
      if (/战马|骑军|羌骑|铁骑/.test(resources)) bonus -= 1;
      if ((city.warDamage || 0) >= 40) bonus -= 8;
      else if ((city.warDamage || 0) >= 20) bonus -= 4;
      return bonus;
    }

    function calculateInitialPublicSupport(city) {
      let value = publicSupportGovernanceTarget(city, null, city.actual || city.controller || city.owner);
      value += stableHash(city.id) % 11 - 5;
      value += factionPublicSupportBonus(city.actual || city.controller || city.owner);
      value += characterPublicSupportBonus(city.id);
      value += cityResourcePublicSupportBonus(city);
      if ((city.warDamage || 0) >= 40) value -= 4;
      const min = cityHasMajorDisruption(city) ? 42 : 60;
      return clamp(Math.round(value), min, 88);
    }

    function applyInitialPublicSupportProfiles(state, preserveExisting = false) {
      Object.values(state.cities || {}).forEach(city => {
        if (city.publicSupportProfileApplied) return;
        const recalculated = calculateInitialPublicSupport(city);
        city.publicSupport = preserveExisting ? Math.max(Number(city.publicSupport || 50), recalculated) : recalculated;
        city.publicSupportProfileApplied = true;
      });
      state.publicSupportSystemVersion = 4;
      return state;
    }

    function applyPublicSupportRebalanceProfiles(state) {
      Object.values(state.cities || {}).forEach(city => {
        if (isRemovedCityId(city.id)) return;
        const ps = Number(city.publicSupport || 0);
        const highPressure = cityHasMajorDisruption(city);
        const floor = highPressure ? 42 : Math.max(60, publicSupportGovernanceTarget(city, null, city.actual || city.controller || city.owner) - 8);
        if (ps < floor) city.publicSupport = Math.min(100, Math.max(ps, floor + (stableHash(city.id) % 5) - 2));
      });
      state.publicSupportSystemVersion = 4;
      return state;
    }

    function createInitialState() {
      const randomTalentSeed = Math.floor(Date.now() % 2147483647) || 190;
      const state = {
        schemaVersion: GAME_SCHEMA_VERSION,
        lastAutoSave: null,
        turn: 1,
        date: { year: 190, month: 3, day: 1 },
        currentAct: 1,
        currentGoal: '稳定桂阳，整顿治安，安抚士族并积累粮草。',
        factions: structuredClone(FACTIONS),
        cities: structuredClone(CITY_BLUEPRINTS),
        armies: [
          {
            id: 'guiyang_guard',
            name: '桂阳郡兵',
            faction: 'player',
            location: 'guiyang',
            destination: null,
            commander: '待定',
            troops: troops(420, 80, 100, 0),
            morale: 66,
            fatigue: 8,
            food: 900,
            loyalty: 72,
            task: '驻防桂阳'
          }
        ],
        characters: {
          liuBiao: { name: '刘表', alive: true, trust: 72, authority: 84, status: '镇守荆州', order: '稳定桂阳' },
          caiMao: { name: '蔡瑁', suspicion: 28, status: '观望' },
          kuaiYue: { name: '蒯越', trust: 42, status: '审慎' },
          huangZu: { name: '黄祖', attitude: 38, status: '守江夏' },
          wenPin: { name: '文聘', trust: 46, status: '治军' },
          guiyangClans: { name: '桂阳豪强', influence: 62, suspicion: 44, status: '试探' },
          jingnanGentry: { name: '荆南士族', trust: 38, suspicion: 36, status: '观望' },
          localOfficials: { name: '地方郡吏', trust: 45, status: '待命' },
          hillChief: { name: '山民首领', attitude: 34, status: '未接触' },
          yuanShao: { name: '袁绍', trust: 55, alert: 22, authority: 86, status: '仍掌河北' },
          caoCao: { name: '曹操', attitude: 20, threat: 34 },
          xuYou: { name: '许攸', favor: 32, support: false },
          guoTu: { name: '郭图', suspicion: 24 },
          shenPei: { name: '审配', suspicion: 22 },
          retinue: { name: '亲信班底', loyalty: 62, network: 24, coup: 0, gate: 0, commander: '亲兵统领', clerk: '主簿', quartermaster: '粮官', scout: '斥候头目' }
        },
        diplomacy: {
          liubiao: { relation: 72, pact: '庇护' },
          yuan: { relation: 55, pact: '主从' },
          cao: { relation: 20, pact: '试探' },
          gongsun: { relation: 25, pact: '疏远' },
          liu: { relation: 36, pact: '无' },
          local: { relation: 34, pact: '可招安' }
        },
        player: {
          name: '',
          title: '桂阳都尉',
          birthplace: '桂阳',
          startingCity: 'guiyang',
          identity: 'commandant',
          faction: 'liubiao',
          controller: 'player',
          protection: 100,
          grainEfficiency: 1,
          actionPointBonuses: { gov: 0, mil: 1, scheme: 0, dip: 0, inner: 0 },
          prestige: 12,
          ambition: 18,
          legitimacy: 54,
          fear: 8,
          independent: false,
          commandSlots: 5
        },
        actionPoints: { gov: 2, mil: 2, scheme: 2, dip: 1, inner: 1 },
        orders: [],
        randomTalentSeed,
        characterRoster: createCharacterRoster(randomTalentSeed),
        characterDiscovery: {},
        selectedCharacterId: 'liuBiao',
        characterProfileId: null,
        characterFilter: 'all',
        conversations: [],
        npcInitiativeState: { lastTurnByNpc: {}, recent: [] },
        specialEventState: { triggered: {}, cooldowns: {}, queue: [] },
        aiContentCache: {},
        aiContentPayloads: {},
        aiContentPending: {},
        aiUsage: { turn: 1, turnDialogueCalls: 0, maxDialogueCallsPerTurn: 5, turnContentCalls: 0, maxContentCallsPerTurn: 6 },
        letters: [],
        militaryOrders: [],
        campaigns: [],
        appointments: {
          cityOfficials: {},
          campaignCommanders: {},
          autoTasks: {}
        },
        urgentMatters: [],
        turnEvents: [],
        turnSummaries: [],
        activeModal: null,
        visualEffects: [],
        gameMode: 'sandbox',
        plotLineStates: {},
        mapState: { zoom: 1, panX: 0, panY: 0 },
        storyFlags: {
          introSeen: false,
          characterCreated: false,
          tutorialStep: 0,
          localTrialResolved: false,
          jingnanOpening: true,
          liuBiaoBreak: null,
          attackedLiuBiao: false,
          voluntarilyBrokeWithLiuBiao: false,
          liuBiaoLoyalActions: { report: 0, loyal: 0, supplies: 0, conceal: 0 },
          plagueState: { activeByCity: {}, lastCheckTurn: 0, lastOutbreakTurn: 0 },
          redemptionLines: {},
          yuanDisarm: false,
          openConflict: false,
          yechengInside: 0,
          guanduPressure: 0,
          northernActUnlocked: false
        },
        aiMemory: { lastCaoMove: 0, lastGongsunMove: 0, localFear: 0, lastProtectionModifiers: {} },
        factionWarState: {
          lastAttackTurnByFaction: {},
          recentWars: []
        },
        publicUnrestState: {
          lastCrisisTurnByCity: {},
          rebellionCities: {},
          intelligenceLeaks: [],
          localDefectionOpportunities: {}
        },
        factionRelations: structuredClone(DEFAULT_FACTION_RELATIONS),
        newsFeed: [
          { tone: 'warn', text: '荆州表面安定，桂阳豪强与地方士族却各有盘算。' },
          { tone: 'good', text: '刘表密令已备，桂阳将成为你在乱世中的第一处立足之地。' }
        ],
        battleReports: [],
        selectedCityId: 'guiyang',
        selectedArmyId: null,
        activePanel: 'city',
        draftBattle: null,
        draftTransfer: null,
        pendingDefense: null,
        militaryPlanner: { sourceId: null, targetId: null, route: 'official' },
        tutorial: {
          skipped: false,
          guideSeen: { introStart: false, liubiao: false, inner: false, transfer: false, scheme: false, diplomacy: false },
          tasks: [
            { id: 'inspectGuiyang', label: '查看桂阳局势', completed: false, description: '点击桂阳城，查看人口、驻军、粮食与治安概况。', nextHint: '完成后将开启城政教学。' },
            { id: 'firstCityOrder', label: '完成一次城政', completed: false, description: '在城政面板下达任意城政命令（征兵、练兵、修城防、屯田、赈济或整顿治安）。', nextHint: '完成城政后需再做一次军事调整。' },
            { id: 'firstMilitaryOrder', label: '完成一次军事调整', completed: false, description: '在军事面板下达一条军事指令，并在结束回合后成功结算。整军、加固防线、预备队或部署进攻均可完成。', nextHint: '点击军事按钮只会加入军令队列；结束回合后指令执行成功，刘表 tab 才会解锁。' },
            { id: 'visitLiuBiao', label: '查看刘表密令', completed: false, description: '打开刘表 tab，了解庇护、信任与荆州关系。', nextHint: '查看后亲信系统将解锁。' },
            { id: 'organizeRetinue', label: '整肃亲信班底', completed: false, description: '在亲信面板执行至少一次亲信行动（整肃亲兵、安插府衙亲信等）。', nextHint: '亲信稳固后调兵与谋略将逐步解锁。' },
            { id: 'unlockTransfer', label: '解锁调兵', completed: false, description: '条件：完成整肃亲信班底后，调兵 tab 将解锁。', nextHint: '解锁后可尝试在己方城池间调兵。' },
            { id: 'unlockScheme', label: '解锁谋略', completed: false, description: '条件：亲信情报网络 ≥ 30 后，谋略 tab 将解锁。', nextHint: '解锁后先刺探邻城，再考虑进攻。' },
            { id: 'unlockDiplomacy', label: '解锁外交', completed: false, description: '条件：声望 ≥ 10 且刘表庇护 ≥ 60 后，外交 tab 将解锁。', nextHint: '解锁后可结盟、借道、示好或求援。' }
          ],
          unlockedTabs: ['city', 'military', 'security'],
          trackedTaskId: null,
          guideQueue: [],
          guidePhase: 0,
          forceAction: null,
          guideCompleted: false,
          highlightedElements: []
        }
      };
      return applyInitialPublicSupportProfiles(state);
    }

    function seededRandom(seed) {
      let value = Number(seed) || 190;
      return () => {
        value = value * 16807 % 2147483647;
        return (value - 1) / 2147483646;
      };
    }

    function normalizeCharacterRecord(record) {
      const base = characterBlueprint(record.id || uid(), record.name || '无名之士', record);
      const inferredPersona = inferNpcPersona(base);
      const personaOverride = NPC_PERSONA_OVERRIDES[base.id] || {};
      base.stats = Object.assign({}, base.stats, record.stats || {});
      base.personality = Object.assign({}, base.personality, record.personality || {});
      base.memory = Array.isArray(record.memory) ? record.memory : [];
      base.relationshipTags = Array.isArray(record.relationshipTags) ? record.relationshipTags : [];
      base.values = uniqueTextList([...(inferredPersona.values || []), ...(personaOverride.values || []), ...(Array.isArray(record.values) ? record.values : [])]);
      base.boundaries = uniqueTextList([...(inferredPersona.boundaries || []), ...(personaOverride.boundaries || []), ...(Array.isArray(record.boundaries) ? record.boundaries : [])]);
      base.longTermGoal = record.longTermGoal || personaOverride.longTermGoal || inferredPersona.longTermGoal;
      base.privateAgenda = record.privateAgenda || personaOverride.privateAgenda || inferredPersona.privateAgenda;
      base.speechStyle = Object.assign({}, inferredPersona.speechStyle || {}, personaOverride.speechStyle || {}, record.speechStyle || {});
      base.initiative = Object.assign({}, inferredPersona.initiative || {}, personaOverride.initiative || {}, record.initiative || {});
      base.specialSchemes = Array.isArray(record.specialSchemes) ? record.specialSchemes : [];
      base.passiveBonuses = Array.isArray(record.passiveBonuses) ? record.passiveBonuses : [];
      base.battleTags = Array.isArray(record.battleTags) && record.battleTags.length ? uniqueTextList(record.battleTags) : inferCharacterBattleTags(base);
      base.weaknesses = Array.isArray(record.weaknesses) ? record.weaknesses : [];
      base.currentPlan = record.currentPlan || personaOverride.currentPlan || '观望局势';
      if (FACTION_LORD_IDS.has(base.id)) {
        const lordMeta = FACTION_LORD_META[base.id] || {};
        base.isFactionLord = true;
        base.lordOfFaction = record.lordOfFaction || base.lordOfFaction || lordMeta.faction || base.faction;
        base.lordTitle = record.lordTitle || base.lordTitle || lordMeta.title || base.title || base.role;
        base.solicitationState = record.solicitationState || base.solicitationState || 'locked';
        base.lordSolicitation = record.lordSolicitation || base.lordSolicitation || null;
      }
      base.npcAgency = Object.assign({
        relationshipStance: 'neutral',
        currentDesire: '',
        shortTermPlan: '',
        planProgress: 0,
        planTarget: '',
        lastPlanTurn: -99,
        lastPlayerReply: null,
        unresolvedPromise: null,
        grievance: null,
        favor: null,
        pendingConversation: false
      }, record.npcAgency || {});
      return base;
    }

    function generateRandomTalents(seed) {
      const random = seededRandom(seed);
      const shuffled = RANDOM_TALENT_NAMES.slice().sort(() => random() - 0.5);
      const count = 8 + Math.floor(random() * 5);
      return shuffled.slice(0, count).map((name, index) => {
        const type = RANDOM_TALENT_TYPES[Math.floor(random() * RANDOM_TALENT_TYPES.length)];
        const location = index < 4 ? 'guiyang' : RANDOM_TALENT_LOCATIONS[Math.floor(random() * RANDOM_TALENT_LOCATIONS.length)];
        const rarityRoll = random();
        const rarity = rarityRoll > 0.9 ? '名将' : rarityRoll > 0.54 ? '良才' : '普通';
        const stat = (base, span = 25) => Math.round(base + random() * span);
        return characterBlueprint('talent_' + seed + '_' + index, name, {
          faction: 'local',
          location,
          role: '随机英才',
          type,
          status: index < 2 ? 'rumored' : 'hidden',
          rarity,
          historical: false,
          randomTalent: true,
          summary: '乡里传闻中的' + type + '，尚待接触。',
          stats: { command: stat(type === '武将' ? 58 : 32), strategy: stat(type === '谋士' ? 60 : 36), politics: stat(type === '政务' ? 60 : 35), charm: stat(40), loyalty: stat(42, 22), ambition: stat(22, 36) },
          personality: { brave: stat(30, 50), cautious: stat(28, 50), greedy: stat(14, 45), loyal: stat(28, 52), proud: stat(18, 54), ruthless: stat(10, 48), idealistic: stat(18, 58) },
          weaknesses: [random() > 0.5 ? '家世寒微' : '尚未证明自己'],
          passiveBonuses: [type === '武将' ? '郡兵训练' : type === '谋士' ? '谋略推进' : type === '商人' ? '商路收入' : '地方治理'],
          recruitmentDifficulty: stat(rarity === '名将' ? 68 : 42, 22),
          discoveredBy: index < 2 ? '乡里传闻' : ''
        });
      });
    }

    function createCharacterRoster(seed) {
      const roster = {};
      Object.entries(CHARACTER_BLUEPRINTS).forEach(([id, record]) => {
        roster[id] = normalizeCharacterRecord(structuredClone(record));
      });
      generateRandomTalents(seed).forEach(record => {
        roster[record.id] = normalizeCharacterRecord(record);
      });
      return roster;
    }

    function mergeCharacterRosterWithBlueprints(savedRoster, seed) {
      const initialRoster = createCharacterRoster(seed);
      const mergedRoster = { ...initialRoster };
      Object.entries(savedRoster || {}).forEach(([id, record]) => {
        const blueprint = initialRoster[id] || {};
        const merged = { ...blueprint, ...(record || {}), id };
        // Prefer blueprint's portraitUrl if the saved value is empty
        if (!merged.portraitUrl && blueprint.portraitUrl) {
          merged.portraitUrl = blueprint.portraitUrl;
        }
        mergedRoster[id] = merged;
      });
      return mergedRoster;
    }

    function ensureCharacterSystemState(state) {
      state.randomTalentSeed ||= Math.floor(Date.now() % 2147483647) || 190;
      state.characterRoster = mergeCharacterRosterWithBlueprints(state.characterRoster, state.randomTalentSeed);
      Object.entries(state.characterRoster).forEach(([id, record]) => {
        state.characterRoster[id] = normalizeCharacterRecord(Object.assign({}, record, { id }));
      });
      if (state.player?.name) {
        state.characterRoster.player ||= normalizeCharacterRecord({
          id: 'player',
          name: state.player.name,
          status: 'active',
          portraitPlaceholder: state.player.name.slice(-2)
        });
        state.characterRoster.player.name = state.player.name;
        state.characterRoster.player.portraitPlaceholder = state.player.name.slice(-2);
      }
      state.characterDiscovery ||= {};
      state.conversations ||= [];
      state.npcInitiativeState ||= { lastTurnByNpc: {}, recent: [] };
      state.npcInitiativeState.lastTurnByNpc ||= {};
      state.npcInitiativeState.recent ||= [];
      state.specialEventState ||= { triggered: {}, cooldowns: {}, queue: [] };
      state.specialEventState.triggered ||= {};
      state.specialEventState.cooldowns ||= {};
      state.specialEventState.queue ||= [];
      state.letters ||= [];
      state.militaryOrders ||= [];
      state.campaigns ||= [];
      state.urgentMatters ||= [];
      state.turnEvents ||= [];
      state.turnSummaries ||= [];
      state.visualEffects ||= [];
      state.selectedCharacterId ||= 'liuBiao';
      state.characterProfileId ||= null;
      state.characterFilter ||= 'all';
      state.player.commandSlots = Number(state.player.commandSlots || 5);
      normalizeAppointments(state);
      state.schemaVersion = GAME_SCHEMA_VERSION;
      return state;
    }

    const CITY_DATA_FIELDS = [
      'id', 'name', 'type', 'level', 'faction', 'nominalOwner', 'controller',
      'population', 'agriculture', 'commerce', 'manpower', 'recruitBase',
      'food', 'money', 'defense', 'publicSupport', 'order', 'morale', 'strategic',
      'terrain', 'resource', 'resources', 'garrison', 'neighbors', 'roads', 'waters',
      'taxRate', 'grainRate', 'taxPolicy', 'grainPolicy', 'unlockChapter', 'isActive'
    ];

    const CITY_DEFAULTS_BY_TYPE = {
      capital: { level: 5, population: 180000, agriculture: 70, commerce: 70, recruitBase: 0.015, food: 7200, money: 1700, defense: 62, publicSupport: 60, order: 60, morale: 60, strategic: 88, garrison: troops(1800, 180, 480, 30) },
      city: { level: 3, population: 95000, agriculture: 56, commerce: 44, recruitBase: 0.014, food: 3400, money: 620, defense: 38, publicSupport: 55, order: 52, morale: 52, strategic: 62, garrison: troops(800, 80, 220, 0) },
      pass: { level: 3, population: 42000, agriculture: 30, commerce: 24, recruitBase: 0.014, food: 1800, money: 320, defense: 72, publicSupport: 56, order: 58, morale: 62, strategic: 88, garrison: troops(900, 60, 250, 20) },
      port: { level: 4, population: 115000, agriculture: 56, commerce: 64, recruitBase: 0.014, food: 4200, money: 1100, defense: 44, publicSupport: 58, order: 56, morale: 56, strategic: 76, garrison: troops(900, 60, 320, 10) },
      region: { level: 3, population: 76000, agriculture: 46, commerce: 34, recruitBase: 0.014, food: 2800, money: 460, defense: 38, publicSupport: 52, order: 48, morale: 50, strategic: 54, garrison: troops(560, 60, 160, 0) }
    };

    // 已删除城市的统一过滤机制
    const REMOVED_CITY_IDS = new Set(['lingling']);

    function isRemovedCityId(id) {
      return REMOVED_CITY_IDS.has(String(id || ''));
    }

    function filterRemovedCityIds(list) {
      return cleanIdArray(list || []).filter(id => !isRemovedCityId(id));
    }

    function isValidPlayableCityId(id) {
      return !!id && !!gameState.cities?.[id] && !isRemovedCityId(id);
    }

    function cleanIdArray(value) {
      return Array.isArray(value)
        ? Array.from(new Set(value.filter(id => typeof id === 'string' && id.length)))
        : [];
    }

    function ensureRoutePair(routes, a, b) {
      const exists = routes.some(([x, y]) =>
        (x === a && y === b) || (x === b && y === a)
      );
      if (!exists) routes.push([a, b]);
    }

    function ensureCityLink(cityData, neighborId, opts = {}) {
      if (!cityData) return;
      cityData.neighbors = cleanIdArray(cityData.neighbors);
      cityData.roads = cleanIdArray(cityData.roads);
      cityData.waters = cleanIdArray(cityData.waters);
      if (!cityData.neighbors.includes(neighborId)) cityData.neighbors.push(neighborId);
      if (opts.road && !cityData.roads.includes(neighborId)) cityData.roads.push(neighborId);
      if (opts.water && !cityData.waters.includes(neighborId)) cityData.waters.push(neighborId);
    }

    function normalizeTroopSet(value) {
      return {
        infantry: Math.max(0, Math.round(Number(value?.infantry || 0))),
        cavalry: Math.max(0, Math.round(Number(value?.cavalry || 0))),
        archers: Math.max(0, Math.round(Number(value?.archers || 0))),
        siege: Math.max(0, Math.round(Number(value?.siege || 0))),
        navy: Math.max(0, Math.round(Number(value?.navy || 0)))
      };
    }

    function inferCityType(id) {
      return CITY_TYPE_BY_ID[id] || 'city';
    }

    function buildFallbackCityData(region) {
      const type = inferCityType(region.id);
      const profile = CITY_DEFAULTS_BY_TYPE[type] || CITY_DEFAULTS_BY_TYPE.city;
      const nominalOwner = region.nominalOwner || 'local';
      const controller = region.controller || nominalOwner;
      return city(region.id, region.name || region.id, nominalOwner, controller, region.center.x, region.center.y, {
        type,
        terrain: region.name + '未详',
        resource: type === 'pass' ? '关隘' : type === 'port' ? '港口' : '地方资源',
        resources: [type === 'pass' ? '关隘' : type === 'port' ? '港口' : '地方资源'],
        neighbors: cleanIdArray(region.neighbors),
        roads: cleanIdArray(region.neighbors),
        waters: [],
        unlockChapter: 1,
        isActive: true,
        ...profile,
        garrison: structuredClone(profile.garrison)
      });
    }

    function normalizeCityData(id, sourceCity, region, isActive) {
      const source = sourceCity || (region ? buildFallbackCityData(region) : {});
      const level = Number(source.level || 1);
      const recruitBase = Number(source.recruitBase ?? 0.014);
      const population = Number(source.population || 0);
      const blueprint = CITY_BLUEPRINTS[id];
      const sourceNominalOwner = source.nominalOwner || source.owner || 'local';
      const sourceController = source.controller || source.actual || sourceNominalOwner;
      const blueprintController = blueprint?.controller || blueprint?.actual;
      const controlChangedFromBlueprint = !!(blueprintController && sourceController && sourceController !== blueprintController);
      const nominalOwner = controlChangedFromBlueprint
        ? sourceNominalOwner
        : (region?.nominalOwner || sourceNominalOwner);
      const controller = controlChangedFromBlueprint
        ? sourceController
        : (region?.controller || sourceController || nominalOwner);
      const primaryResource = source.resource || '无';
      const resources = Array.from(new Set((source.resources || []).concat(primaryResource))).filter(Boolean);
      const center = region?.center || { x: Number(source.x || 0), y: Number(source.y || 0) };
      const normalized = {
        ...source,
        id,
        name: region?.name || source.name || id,
        type: source.type || inferCityType(id),
        level,
        faction: controller,
        nominalOwner,
        controller,
        owner: nominalOwner,
        actual: controller,
        x: center.x,
        y: center.y,
        population,
        agriculture: Number(source.agriculture || 0),
        commerce: Number(source.commerce || 0),
        manpower: Number(source.manpower || Math.round(population * recruitBase)),
        recruitBase,
        food: Number(source.food ?? source.foodStock ?? 0),
        money: Number(source.money ?? source.treasury ?? 0),
        defense: Number(source.defense || 0),
        publicSupport: Number(source.publicSupport ?? 50),
        order: Number(source.order ?? source.publicOrder ?? 50),
        morale: Number(source.morale ?? 50),
        strategic: Number(source.strategic || 0),
        terrain: source.terrain || '未设定',
        resource: primaryResource,
        resources,
        garrison: normalizeTroopSet(source.garrison),
        neighbors: cleanIdArray(source.neighbors),
        roads: cleanIdArray(source.roads),
        waters: cleanIdArray(source.waters),
        taxRate: Number(source.taxRate ?? 42),
        grainRate: Number(source.grainRate ?? 28),
        taxPolicy: source.taxPolicy || 'normal',
        grainPolicy: source.grainPolicy || 'market',
        unlockChapter: Number(source.unlockChapter || 1),
        isActive: Boolean(isActive),
        cityLevel: level
      };
      normalized.domain = normalized.domain || (level >= 5 ? 72 : level >= 4 ? 62 : level >= 3 ? 52 : 42);
      normalizeCityPolicy(normalized);
      return normalized;
    }

    function regionFromCityData(region, cityData) {
      return {
        id: region.id,
        name: region.name || cityData.name,
        type: cityData.type,
        center: structuredClone(region.center),
        polygon: structuredClone(region.polygon),
        completed: region.completed === true,
        nominalOwner: cityData.nominalOwner || region.nominalOwner,
        controller: cityData.controller || region.controller,
        faction: cityData.controller || region.controller,
        level: cityData.level,
        cityLevel: cityData.level,
        population: cityData.population,
        agriculture: cityData.agriculture,
        commerce: cityData.commerce,
        manpower: cityData.manpower,
        recruitBase: cityData.recruitBase,
        food: cityData.food,
        foodStock: cityData.food,
        money: cityData.money,
        treasury: cityData.money,
        defense: cityData.defense,
        publicSupport: cityData.publicSupport,
        publicOrder: cityData.order,
        order: cityData.order,
        morale: cityData.morale,
        strategic: cityData.strategic,
        terrain: cityData.terrain,
        resource: cityData.resource,
        resources: structuredClone(cityData.resources),
        garrison: realTroops(cityData.garrison),
        neighbors: [],
        roads: [],
        waters: [],
        taxRate: cityData.taxRate,
        grainRate: cityData.grainRate,
        taxPolicy: cityData.taxPolicy,
        grainPolicy: cityData.grainPolicy,
        unlockChapter: cityData.unlockChapter,
        isActive: cityData.isActive
      };
    }

    function mergeMapRegionsWithCityData(mapRegions, cityBlueprints) {
      const regions = {};
      const cities = {};
      const activeIds = new Set();
      Object.entries(mapRegions || {}).forEach(([id, region]) => {
        if (!hasMarkedPolygon(region)) return;
        activeIds.add(id);
        const cityData = normalizeCityData(id, cityBlueprints[id], region, true);
        cities[id] = cityData;
        regions[id] = regionFromCityData(region, cityData);
      });
      Object.entries(cityBlueprints || {}).forEach(([id, cityData]) => {
        if (activeIds.has(id)) return;
        cities[id] = normalizeCityData(id, cityData, null, false);
      });
      Object.values(regions).forEach(region => {
        const cityData = cities[region.id];
        region.neighbors = cityData.neighbors.filter(neighborId => !!regions[neighborId]);
        region.roads = cityData.roads.filter(neighborId => !!regions[neighborId]);
        region.waters = cityData.waters.filter(neighborId => !!regions[neighborId]);
      });
      return {
        regions,
        cities,
        inactiveCityIds: Object.keys(cities).filter(id => !activeIds.has(id))
      };
    }

    function createMapData() {
      const manualRegions = getManualMapRegions() || {};
      const merged = mergeMapRegionsWithCityData(manualRegions, gameState.cities || {});
      gameState.cities = merged.cities;
      return {
        width: MAP_SIZE.width,
        height: MAP_SIZE.height,
        factions: FACTIONS,
        regions: merged.regions,
        cityData: gameState.cities,
        inactiveCityIds: merged.inactiveCityIds,
        subRegions: {}
      };
    }

    function syncMapDataFromGameState() {
      if (!mapData) return;
      Object.values(mapData.regions).forEach(region => {
        const city = gameState.cities[region.id];
        if (!city) return;
        const bonus = getRegionBonus(region.id);
        normalizeCityPolicy(city);
        region.name = city.name;
        city.x = region.center.x;
        city.y = region.center.y;
        city.owner = region.nominalOwner;
        city.actual = region.controller;
        city.nominalOwner = region.nominalOwner;
        city.controller = region.controller;
        city.faction = region.controller;
        city.isActive = true;
        region.type = city.type;
        region.faction = region.controller;
        region.level = city.level;
        region.cityLevel = city.level;
        region.population = city.population;
        region.agriculture = city.agriculture + (bonus.agriculture || 0);
        region.commerce = city.commerce + (bonus.commerce || 0);
        region.manpower = Math.round(city.population * city.recruitBase) + (bonus.manpower || 0);
        region.recruitBase = city.recruitBase;
        region.food = city.food + (bonus.foodStock || 0);
        region.foodStock = region.food;
        region.money = city.money + (bonus.treasury || 0);
        region.treasury = region.money;
        region.publicSupport = city.publicSupport;
        region.publicOrder = city.order;
        region.order = city.order;
        region.defense = city.defense + (bonus.defense || 0);
        region.morale = city.morale;
        region.strategic = city.strategic + (bonus.strategic || 0);
        region.terrain = city.terrain;
        region.resource = city.resource;
        region.resources = Array.from(new Set((city.resources || []).concat([city.resource]))).filter(Boolean);
        region.garrison = realTroops(city.garrison);
        region.neighbors = cleanIdArray(city.neighbors).filter(neighborId => !!mapData.regions[neighborId]);
        region.roads = cleanIdArray(city.roads).filter(neighborId => !!mapData.regions[neighborId]);
        region.waters = cleanIdArray(city.waters).filter(neighborId => !!mapData.regions[neighborId]);
        region.taxRate = city.taxRate;
        region.grainRate = city.grainRate;
        region.taxPolicy = city.taxPolicy;
        region.grainPolicy = city.grainPolicy;
        region.unlockChapter = city.unlockChapter;
        region.isActive = city.isActive;
      });
      mapData.cityData = gameState.cities;
      mapData.inactiveCityIds = Object.keys(gameState.cities).filter(id => !mapData.regions[id]);
    }

    const loadedGameState = loadFromStorage(false);
    var gameState = ensureCharacterSystemState(loadedGameState || createInitialState());
    let characterDraft = { name: gameState.player.name || '', identity: gameState.player.identity || 'commandant' };
    let launchScreen = 'auth';
    let selectedNewGameMode = 'sandbox';
    let authMode = 'login';
    let authUser = null;
    let characterCreationStep = 'arrival';
    let openingTransitionMode = 'audience';
    let openingTransitionTimer = null;
    let officeHandoffTimer = null;
    let isComposingPlayerName = false;
    FACTIONS.player.name = gameState.player.name || '玩家';
    let mapData = createMapData();
    let dragState = null;
    let suppressNextMapClick = false;
    let calibrationState = {
      enabled: false,
      selectedRegionId: 'guiyang',
      lastPoint: null,
      draggingCenter: null
    };

    syncMapDataFromGameState();

    function getRegionBonus(cityId) {
      const effects = getCityStrategicEffects(cityId);
      return {
        agriculture: effects.agriculture,
        commerce: effects.commerce,
        defense: effects.defense,
        strategic: effects.strategic,
        manpower: effects.manpower,
        foodStock: effects.foodStock,
        treasury: effects.treasury
      };
    }

    function getCityStrategicSource(cityOrId) {
      const city = typeof cityOrId === 'string' ? gameState.cities?.[cityOrId] : cityOrId;
      if (!city) return { city: null, text: '' };
      const values = [city.name, city.terrain, city.resource, ...(Array.isArray(city.resources) ? city.resources : [])]
        .filter(Boolean)
        .map(String);
      return { city, text: values.join('、') };
    }

    function getCityStrategicTags(cityOrId) {
      const { city, text } = getCityStrategicSource(cityOrId);
      if (!city) return [];
      const tags = [];
      const has = pattern => pattern.test(text);
      if (has(/战马|胡马|边骑|骑军|羌骑|铁骑|牧场|骑路/)) tags.push({ id: 'cavalry', label: '骑兵产地', desc: '练骑兵效率提高，骑兵出征更有优势' });
      if (has(/水军|水寨|江港|水网|商港|海盐|远海商路|水道|江|河|津|渡|港/)) tags.push({ id: 'navy', label: '水战枢纽', desc: '练水兵效率提高，水路行军和水战更可靠' });
      if (has(/兵源|民户|民兵|州府|宗族|士族|铁器|铜铁|羌胡兵|兵家旧地/)) tags.push({ id: 'land', label: '陆兵根基', desc: '练陆兵效率提高，常规作战更稳定' });
      if (has(/山道|山地|险峡|栈道|关隘|驼队|边市|旧地/)) tags.push({ id: 'raid', label: '突袭地利', desc: '突袭、截粮与山道推进收益提高' });
      if (has(/粮仓|沃野|稻米|稻麦|粮田|麦田|米道|粮道/)) tags.push({ id: 'food', label: '粮食特产', desc: '农业与粮草储备提高' });
      if (has(/商路|商港|盐铁|盐井|海盐|远海商路|玉门商旅|边市|府库|银矿|铜矿/)) tags.push({ id: 'commerce', label: '商贸资源', desc: '商业与府库收入提高' });
      if (has(/关隘|险峡|栈道|坚城|要塞|重城|锁钥|门户|新城/)) tags.push({ id: 'defense', label: '防御要地', desc: '城防与守备收益提高' });
      if (has(/天子|帝都|州府|名士|名望|仁望|郡望|旧都/)) tags.push({ id: 'prestige', label: '名望重地', desc: '战略价值与人才吸引力提高' });
      return tags;
    }

    function getCityStrategicEffects(cityOrId) {
      const tags = getCityStrategicTags(cityOrId);
      const city = typeof cityOrId === 'string' ? gameState.cities?.[cityOrId] : cityOrId;
      const waters = Array.isArray(city?.waters) && city.waters.length > 0;
      const has = id => tags.some(tag => tag.id === id);
      return {
        tags,
        agriculture: (has('food') ? 8 : 0) + (has('land') ? 2 : 0),
        commerce: (has('commerce') ? 8 : 0) + (has('prestige') ? 2 : 0),
        defense: has('defense') ? 6 : has('raid') ? 2 : 0,
        strategic: has('prestige') ? 6 : has('defense') ? 4 : has('navy') || has('cavalry') ? 3 : 0,
        manpower: (has('land') ? 420 : 0) + (has('cavalry') ? 160 : 0),
        foodStock: has('food') ? 520 : 0,
        treasury: has('commerce') ? 180 : 0,
        training: {
          land: 1 + (has('land') ? 0.28 : 0) + (has('food') ? 0.08 : 0),
          cavalry: 1 + (has('cavalry') ? 0.42 : 0) + (has('commerce') ? 0.06 : 0),
          navy: 1 + (has('navy') ? 0.46 : 0) + (waters ? 0.16 : -0.12),
          raid: 1 + (has('raid') ? 0.22 : 0)
        },
        battle: {
          official: 1 + (has('land') ? 0.04 : 0),
          river: 1 + (has('navy') ? 0.08 : 0),
          raid: 1 + (has('raid') ? 0.08 : 0)
        }
      };
    }

    function getRegion(cityId) {
      return mapData && mapData.regions ? mapData.regions[cityId] : null;
    }

    function regionName(regionId) {
      return getRegion(regionId)?.name || gameState.cities[regionId]?.name || regionId;
    }

    function factionName(factionId) {
      return FACTIONS[factionId]?.name || factionId || '未知';
    }

    function applyEmbeddedMapImage() {
      const image = document.getElementById('mapImageLayer');
      const preload = document.getElementById('mapPreload');
      const mapUrl = window.SANGUO_MAP_IMAGE_URL || './assets/map.png';
      if (preload) preload.src = mapUrl;
      if (image) {
        image.setAttribute('href', mapUrl);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', mapUrl);
      }
      document.documentElement.style.setProperty('--map-image', 'url("' + mapUrl + '")');
    }

    function fmt(value) {
      return Math.round(value).toLocaleString('zh-CN');
    }

    function fmtPercent(value) {
      return Math.round(Number(value || 0) * 100) + '%';
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function totalTroops(t) {
      if (!t) return 0;
      return Math.max(0, Math.round((t.infantry || 0) + (t.cavalry || 0) + (t.archers || 0) + (t.navy || 0) + (t.siege || 0) * 8));
    }

    function realTroops(t) {
      if (!t) return 0;
      return Math.max(0, Math.round((t.infantry || 0) + (t.cavalry || 0) + (t.archers || 0) + (t.siege || 0) + (t.navy || 0)));
    }

    function troopBreakdownText(t) {
      const g = normalizeTroopSet(t || {});
      return '步 ' + fmt(g.infantry) + '｜骑 ' + fmt(g.cavalry) + '｜弓 ' + fmt(g.archers) + '｜水 ' + fmt(g.navy) + '｜器 ' + fmt(g.siege);
    }

    function characterStatusName(status) {
      const table = {
        hidden: '未现身',
        rumored: '传闻中',
        discovered: '已探知',
        contactable: '可接触',
        recruited: '已招募',
        dead: '已故',
        captured: '被俘'
      };
      return table[status] || status || '未知';
    }

    function campaignStatusName(status) {
      const table = {
        marching: '行军中',
        siege: '围城中',
        complete: '已结束',
        cancelled: '已取消',
        retreated: '已撤退',
        destroyed: '全军覆没'
      };
      return table[status] || status || '未知';
    }

    function plotStatusName(status) {
      const table = {
        inactive: '未开启',
        active: '进行中',
        completed: '已完结'
      };
      return table[status] || status || '未知';
    }

    function cityController(cityOrId) {
      const id = typeof cityOrId === 'string' ? cityOrId : cityOrId?.id;
      const city = typeof cityOrId === 'string' ? gameState.cities[id] : cityOrId;
      const region = id ? getRegion(id) : null;
      return region?.controller || city?.controller || city?.actual || city?.owner || 'local';
    }

    function cityNominalOwner(cityOrId) {
      const id = typeof cityOrId === 'string' ? cityOrId : cityOrId?.id;
      const city = typeof cityOrId === 'string' ? gameState.cities[id] : cityOrId;
      const region = id ? getRegion(id) : null;
      return region?.nominalOwner || city?.nominalOwner || city?.owner || cityController(cityOrId);
    }

    function isActiveMapCity(cityId) {
      const city = gameState.cities[cityId];
      return !!city && city.isActive !== false && !!getRegion(cityId);
    }

    function isControlledBy(cityId, factionId) {
      return cityController(cityId) === factionId;
    }

    function ensureDiplomacyRecord(factionId) {
      if (!factionId || factionId === 'player') return null;
      gameState.diplomacy ||= {};
      gameState.diplomacy[factionId] ||= { relation: 30, pact: '未接触' };
      gameState.diplomacy[factionId].alliance ||= null;
      return gameState.diplomacy[factionId];
    }

    function ensureAllDiplomacyRecords() {
      Object.keys(FACTIONS).forEach(factionId => {
        if (factionId !== 'player') ensureDiplomacyRecord(factionId);
      });
    }

    function getLordCharacterByFaction(factionId) {
      return Object.values(gameState.characterRoster || {}).find(character =>
        character && isFactionLordCharacter(character) &&
        (character.lordOfFaction === factionId || FACTION_LORD_META[character.id]?.faction === factionId)
      ) || null;
    }

    function isPlayerAlliedWithFaction(factionId) {
      const record = ensureDiplomacyRecord(factionId);
      return record?.pact === '盟友' && record.alliance?.active !== false;
    }

    function setFactionRelation(factionA, factionB, value) {
      if (!factionA || !factionB || factionA === factionB) return;
      gameState.factionRelations ||= structuredClone(DEFAULT_FACTION_RELATIONS);
      gameState.factionRelations[factionA] ||= {};
      gameState.factionRelations[factionB] ||= {};
      gameState.factionRelations[factionA][factionB] = value;
      gameState.factionRelations[factionB][factionA] = value;
    }

    function getFactionRelationValue(factionA, factionB) {
      if (factionA === factionB) return 100;
      const row = gameState.factionRelations?.[factionA] || {};
      return Number(row[factionB] ?? DEFAULT_FACTION_RELATIONS[factionA]?.[factionB] ?? 0);
    }

    function getPlayerEnemyFactions() {
      const enemies = new Set();
      Object.keys(FACTIONS).forEach(fid => {
        if (fid !== 'player' && fid !== 'local' && getFactionRelationValue('player', fid) <= -20) enemies.add(fid);
      });
      (gameState.campaigns || []).filter(isActiveCampaign).forEach(campaign => {
        const targetController = cityController(campaign.target);
        if (campaign.faction === 'player' && targetController && targetController !== 'player' && targetController !== 'local') {
          enemies.add(targetController);
        }
        if (campaign.faction && campaign.faction !== 'player' && targetController === 'player') {
          enemies.add(campaign.faction);
        }
      });
      (gameState.factionWarState?.recentWars || []).forEach(war => {
        if (!war || gameState.turn - Number(war.turn || 0) > 12) return;
        const defender = war.defender || cityController(war.target);
        if (war.attacker === 'player' && defender && defender !== 'player' && defender !== 'local') {
          enemies.add(defender);
        }
        if (war.attacker && war.attacker !== 'player' && defender === 'player') {
          enemies.add(war.attacker);
        }
      });
      return [...enemies];
    }

    function getCommonEnemiesWithPlayer(factionId) {
      const playerEnemies = getPlayerEnemyFactions();
      return playerEnemies.filter(other =>
        other !== factionId &&
        (getFactionRelationValue(factionId, other) <= -20 ||
          (getAllianceProfile(factionId).preferredEnemies || []).includes(other))
      );
    }

    function getOutrageFactions() {
      const outrage = {};
      Object.keys(FACTIONS).forEach(fid => { outrage[fid] = 0; });
      Object.entries(gameState.factionRelations || DEFAULT_FACTION_RELATIONS).forEach(([from, rels]) => {
        Object.entries(rels || {}).forEach(([to, value]) => {
          if (to === 'player' || to === 'local') return;
          if (Number(value) <= -25) outrage[to] = (outrage[to] || 0) + 1;
        });
      });
      (gameState.factionWarState?.recentWars || []).forEach(war => {
        if (!war || gameState.turn - Number(war.turn || 0) > 12) return;
        if (war.attacker && war.attacker !== 'player' && war.attacker !== 'local') outrage[war.attacker] = (outrage[war.attacker] || 0) + 1.4;
      });
      return Object.entries(outrage)
        .filter(([, score]) => score >= 3)
        .map(([fid]) => fid);
    }

    const ALLIANCE_PROFILES = {
      liu: { focus: '共同抗曹、仁义声望与民心', minRelation: 42, minPrestige: 35, minPublic: 58, preferredEnemies: ['cao', 'yuanshu'], needsCommonEnemy: true, outrageOk: true },
      cao: { focus: '共同强敌、秩序与现实利益', minRelation: 55, minPrestige: 48, minOrder: 55, preferredEnemies: ['yuan', 'yuanshu', 'zhanglu'], needsCommonEnemy: true, outrageOk: false },
      sun: { focus: '江东安全、水路压力与抗强敌', minRelation: 45, minPrestige: 38, minCityCount: 3, preferredEnemies: ['cao', 'liubiao', 'yuanshu'], needsCommonEnemy: true, outrageOk: true },
      yuan: { focus: '名望、体面与共同威胁', minRelation: 50, minPrestige: 60, minCityCount: 4, preferredEnemies: ['cao', 'gongsun', 'yuanshu'], needsCommonEnemy: true, outrageOk: true },
      liubiao: { focus: '荆州稳定、合法性与共同外患', minRelation: 52, minPrestige: 45, minPublic: 55, preferredEnemies: ['sun', 'cao', 'yuanshu'], needsCommonEnemy: false, outrageOk: true },
      liuzhang: { focus: '益州安全、低威胁和共同外患', minRelation: 38, minPublic: 52, minOrder: 50, preferredEnemies: ['zhanglu', 'cao'], needsCommonEnemy: false, outrageOk: true },
      zhanglu: { focus: '地方自治、秩序和共同压力', minRelation: 38, minOrder: 58, preferredEnemies: ['liuzhang', 'cao', 'mateng'], needsCommonEnemy: false, outrageOk: true },
      mateng: { focus: '抗曹、军力与边地互保', minRelation: 35, minPrestige: 35, preferredEnemies: ['cao', 'zhanglu'], needsCommonEnemy: true, outrageOk: true },
      gongsun: { focus: '抗袁、北方战局和军力声望', minRelation: 35, minPrestige: 35, preferredEnemies: ['yuan', 'cao'], needsCommonEnemy: true, outrageOk: true },
      yuanshu: { focus: '利益、体面和对众敌自保', minRelation: 50, minPrestige: 45, preferredEnemies: ['cao', 'yuan', 'liu'], needsCommonEnemy: false, outrageOk: true },
      default: { focus: '关系、共同敌人和局势压力', minRelation: 42, minPrestige: 35, preferredEnemies: [], needsCommonEnemy: true, outrageOk: true }
    };

    function getAllianceProfile(factionId) {
      return ALLIANCE_PROFILES[factionId] || ALLIANCE_PROFILES.default;
    }

    function getAllianceEligibility(character) {
      if (!character || !isFactionLordCharacter(character)) return { eligible: false, reason: '只有势力主公可以正式结盟。' };
      const factionId = character.lordOfFaction || FACTION_LORD_META[character.id]?.faction || character.faction;
      if (isPlayerAlliedWithFaction(factionId)) return { eligible: true, allied: true, reason: '已结盟，可随时正式解约。' };
      const profile = getAllianceProfile(factionId);
      const record = ensureDiplomacyRecord(factionId);
      const relation = Number(record?.relation || 0);
      const prestige = Number(gameState.player?.prestige || 0);
      const publicSupport = getPlayerAveragePublicSupport();
      const order = getPlayerAverageOrder();
      const cityCount = controlledCities().length;
      const commonEnemies = getCommonEnemiesWithPlayer(factionId);
      const outrageFactions = getOutrageFactions();
      const preferredCommonEnemies = commonEnemies.filter(fid => profile.preferredEnemies?.includes(fid));
      const hasCommonEnemy = commonEnemies.length > 0;
      const hasPreferredEnemy = preferredCommonEnemies.length > 0;
      const outrageMatch = outrageFactions.some(fid => fid !== factionId && (profile.preferredEnemies?.includes(fid) || profile.outrageOk));
      const pressure = getFactionPressureProfile(factionId);
      const checks = [
        { label: '关系', ok: relation >= (profile.minRelation || 40), detail: Math.round(relation) + ' / ' + (profile.minRelation || 40) },
        { label: '声望', ok: prestige >= (profile.minPrestige || 0), detail: Math.round(prestige) + ' / ' + (profile.minPrestige || 0) },
        { label: '民心', ok: publicSupport >= (profile.minPublic || 0), detail: Math.round(publicSupport) + ' / ' + (profile.minPublic || 0) },
        { label: '治安', ok: order >= (profile.minOrder || 0), detail: Math.round(order) + ' / ' + (profile.minOrder || 0) },
        { label: '城池', ok: cityCount >= (profile.minCityCount || 1), detail: cityCount + ' / ' + (profile.minCityCount || 1) },
        { label: '共同敌人/众愤', ok: !profile.needsCommonEnemy || hasCommonEnemy || outrageMatch || pressure.pressure >= 55, detail: commonEnemies.map(factionName).join('、') || (outrageMatch ? '存在众愤势力' : '暂无') }
      ];
      const failed = checks.filter(item => !item.ok);
      const eligible = failed.length === 0 || (failed.length === 1 && (hasPreferredEnemy || pressure.pressure >= 70));
      return {
        eligible,
        allied: false,
        factionId,
        profile,
        record,
        relation,
        commonEnemies,
        preferredCommonEnemies,
        outrageFactions,
        pressure,
        checks,
        failed,
        reason: eligible
          ? '具备结盟条件。'
          : '结盟条件不足：' + failed.map(item => item.label + ' ' + item.detail).join('；')
      };
    }

    function formAllianceWithFaction(factionId, options = {}) {
      const record = ensureDiplomacyRecord(factionId);
      if (!record) return false;
      const lord = options.lord || getLordCharacterByFaction(factionId);
      record.pact = '盟友';
      record.relation = clamp(Math.max(Number(record.relation || 0), 68) + Number(options.relationBonus || 0), 0, 100);
      record.alliance = {
        active: true,
        sinceTurn: gameState.turn,
        withLordId: lord?.id || '',
        initiator: options.initiator || 'player',
        lastAidTurn: -99,
        lastRequestTurn: -99,
        cancelledTurn: null,
        cancelledBy: ''
      };
      setFactionRelation('player', factionId, 80);
      if (lord) {
        lord.npcAgency ||= {};
        lord.npcAgency.relationshipStance = 'ally';
        lord.trustPlayer = clamp(Number(lord.trustPlayer || 0) + 6, 0, 100);
        lord.respectPlayer = clamp(Number(lord.respectPlayer || 0) + 4, 0, 100);
        addCharacterMemory(lord, {
          turn: gameState.turn,
          type: 'alliance',
          summary: lord.name + '与玩家正式结盟。',
          text: lord.name + '与玩家正式结盟。'
        });
      }
      return true;
    }

    function cancelAllianceWithFaction(factionId, cancelledBy = 'player', reports = null) {
      const record = ensureDiplomacyRecord(factionId);
      if (!record || record.pact !== '盟友') return false;
      record.pact = '解约';
      record.relation = clamp(Number(record.relation || 0) - (cancelledBy === 'player' ? 10 : 14), 0, 100);
      record.alliance ||= {};
      record.alliance.active = false;
      record.alliance.cancelledTurn = gameState.turn;
      record.alliance.cancelledBy = cancelledBy;
      setFactionRelation('player', factionId, Math.min(20, Number(record.relation || 0) - 30));
      const lord = getLordCharacterByFaction(factionId);
      if (lord) {
        lord.suspicionOfPlayer = clamp(Number(lord.suspicionOfPlayer || 0) + (cancelledBy === 'player' ? 8 : 4), 0, 100);
        addCharacterMemory(lord, {
          turn: gameState.turn,
          type: 'allianceCancelled',
          summary: (cancelledBy === 'player' ? '玩家' : lord.name) + '单方面解除盟约。',
          text: (cancelledBy === 'player' ? '玩家' : lord.name) + '单方面解除盟约。'
        });
      }
      const text = (cancelledBy === 'player' ? '你' : factionName(factionId)) + '正式解除与' + (cancelledBy === 'player' ? factionName(factionId) : '玩家') + '的盟约。';
      if (reports) reports.push({ tone: 'warn', level: 'important', text });
      else addNews('warn', text);
      return true;
    }

    function penalizeAttackingAlliance(factionId, reports) {
      if (!isPlayerAlliedWithFaction(factionId)) return false;
      gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) - 18, 0, 100);
      controlledCities().forEach(city => {
        city.publicSupport = clamp(Number(city.publicSupport || 0) - 2, 0, 100);
      });
      const record = ensureDiplomacyRecord(factionId);
      record.relation = clamp(Number(record.relation || 0) - 30, 0, 100);
      const text = '你袭击盟友' + factionName(factionId) + '，民心小幅下降，声望大幅受损。盟约仍未自动解除。';
      if (reports) reports.push({ tone: 'bad', level: 'critical', text });
      else addNews('bad', text);
      return true;
    }

    function cityNeighborIds(cityId) {
      const city = gameState.cities?.[cityId];
      const region = getRegion(cityId);
      const ids = new Set();

      const addMany = (list) => {
        cleanIdArray(list || []).forEach(id => {
          if (id && id !== cityId) ids.add(id);
        });
      };

      addMany(city?.neighbors);
      addMany(city?.roads);
      addMany(city?.waters);

      addMany(region?.neighbors);
      addMany(region?.roads);
      addMany(region?.waters);

      (ROUTES || []).forEach(([a, b]) => {
        if (a === cityId) ids.add(b);
        if (b === cityId) ids.add(a);
      });

      (WATER_ROUTES || []).forEach(([a, b]) => {
        if (a === cityId) ids.add(b);
        if (b === cityId) ids.add(a);
      });

      return Array.from(ids).filter(id => {
        return id !== cityId && !isRemovedCityId(id) && !!gameState.cities?.[id];
      });
    }

    function factionOfCity(city) {
      if (!city) return 'local';
      if (cityController(city) === 'player' && gameState.player.independent) return 'player';
      return cityNominalOwner(city);
    }

    function controlColor(city) {
      const controller = cityController(city);
      return FACTIONS[controller] ? FACTIONS[controller].color : FACTIONS[factionOfCity(city)].color;
    }

    function regionFill(region) {
      const controller = region.controller || 'local';
      return FACTIONS[controller] ? FACTIONS[controller].color : FACTIONS.local.color;
    }

    function regionControllerName(region) {
      const controller = region.controller || 'local';
      return FACTIONS[controller] ? FACTIONS[controller].name : controller;
    }

    function liubiaoProtectionActive() {
      const player = gameState.player;
      const liuBiao = gameState.characters.liuBiao;
      return liuBiao?.alive !== false
        && player.faction === 'liubiao'
        && !player.independent
        && player.protection > 0;
    }

    function protectionLevel() {
      const value = clamp(gameState.player.protection || 0, 0, 100);
      if (value >= 80) return { name: '强庇护', tone: 'good' };
      if (value >= 50) return { name: '一般庇护', tone: 'warn' };
      if (value >= 20) return { name: '弱庇护', tone: 'warn' };
      return { name: '名存实亡', tone: 'bad' };
    }

    function protectionModifier(kind) {
      if (!liubiaoProtectionActive()) return 1;
      const floor = {
        npcAttack: 0.4,
        scheme: 0.5,
        assassination: 0.3,
        persuade: 0.5
      }[kind] || 1;
      return 1 - clamp(gameState.player.protection, 0, 100) / 100 * (1 - floor);
    }

    function protectedNpcChance(kind, baseChance) {
      const chance = baseChance * protectionModifier(kind);
      gameState.aiMemory.lastProtectionModifiers ||= {};
      gameState.aiMemory.lastProtectionModifiers[kind] = protectionModifier(kind);
      return chance;
    }

    function applyProtectionDecay(amount, reason, reports) {
      const before = clamp(gameState.player.protection || 0, 0, 100);
      if (!amount || before <= 0) return;
      gameState.player.protection = clamp(before - amount, 0, 100);
      const item = { tone: 'warn', text: '刘表庇护 -' + amount + '：' + reason + '。当前 ' + gameState.player.protection + '。' };
      if (reports) reports.push(item);
      else addNews(item.tone, item.text);
      if (isStoryMode() && gameState.player.protection <= 0) {
        triggerLiuBiaoUltimatum(reports, 'collapse');
      }
    }

    function clearLiuBiaoProtectionForPlayerAttack(defenderFaction, reports = []) {
      if (!isStoryMode() || defenderFaction !== 'liubiao') return false;
      const before = clamp(Number(gameState.player?.protection || 0), 0, 100);
      if (before <= 0) return false;
      gameState.storyFlags ||= {};
      gameState.storyFlags.attackedLiuBiao = true;
      gameState.player.protection = 0;
      const item = { tone: 'bad', level: 'critical', text: '你已主动攻击刘表势力，刘表庇护清零。' };
      if (reports) reports.push(item);
      else addNews(item.tone, item.text);
      return true;
    }

    function liuBiaoBreakState() {
      gameState.storyFlags ||= {};
      return gameState.storyFlags.liuBiaoBreak || null;
    }

    function liuBiaoBreakActive() {
      const state = liuBiaoBreakState();
      return !!state && !['surrendered', 'observing'].includes(state.status) && state.stage !== 'war';
    }

    function liuBiaoAttitudeLabel() {
      const state = liuBiaoBreakState();
      if (state?.attitude) return state.attitude;
      if (state?.stage === 'war') return '不死不休';
      if (gameState.player?.independent && isStoryMode()) return '断绝名分';
      return protectionLevel().name;
    }

    function triggerLiuBiaoUltimatum(reports = [], source = 'collapse') {
      if (!isStoryMode()) return false;
      const existing = liuBiaoBreakState();
      if (existing && existing.status !== 'observing') return false;
      gameState.player.protection = 0;
      gameState.storyFlags.liuBiaoBreak = {
        status: 'ultimatum',
        source,
        stage: 1,
        startedTurn: gameState.turn,
        ultimatumTurn: gameState.turn,
        troopsTurn: null,
        warTurn: null,
        surrendered: false,
        refused: false,
        kuaiYueWarning: source !== 'lowProtectionIndependence',
        attitude: source === 'activeIndependence' ? '震怒且失望' : '体面将尽'
      };
      gameState.characters.liuBiao.trust = clamp(Number(gameState.characters.liuBiao.trust || 0) - 18, 0, 100);
      gameState.characters.liuBiao.status = '发出最后通牒';
      ensureDiplomacyRecord('liubiao').pact = '最后通牒';
      createLetter({
        senderId: 'liuBiao',
        title: '最后通牒',
        body: '桂阳之事，吾已知悉。尔若三日内亲赴襄阳自辩，尚可留体面。',
        critical: true,
        kind: 'liuBiaoBreak',
        meta: { stage: 'ultimatum' },
        choices: [
          { id: 'surrender', label: '亲赴襄阳自辩' },
          { id: 'refuse', label: '拒绝赴命' }
        ]
      });
      reports.push({ tone: 'bad', level: 'critical', text: '庇护崩溃：刘表发来最后通牒，要求你亲赴襄阳自辩。' });
      return true;
    }

    function deployLiuBiaoPressureForces(reports = []) {
      const state = liuBiaoBreakState();
      if (!isStoryMode() || !state || state.stage >= 2 || state.stage === 'war' || state.status === 'war' || state.status === 'surrendered') return false;
      const existingIds = new Set((gameState.armies || []).map(army => army.id));
      if (!existingIds.has('liubiao_kuaiyue_pressure')) {
        gameState.armies.push({
          id: 'liubiao_kuaiyue_pressure',
          name: '蒯越襄阳兵',
          faction: 'liubiao',
          location: gameState.cities.changsha ? 'changsha' : 'xiangyang',
          destination: 'guiyang',
          commander: '蒯越',
          troops: troops(1980, 360, 660, 0),
          morale: 72,
          fatigue: 0,
          food: 1200,
          loyalty: 80,
          task: '压迫桂阳'
        });
      }
      if (!existingIds.has('liubiao_wenpin_pressure')) {
        gameState.armies.push({
          id: 'liubiao_wenpin_pressure',
          name: '文聘荆州军',
          faction: 'liubiao',
          location: gameState.cities.jiangxia ? 'jiangxia' : 'xiangyang',
          destination: 'guiyang',
          commander: '文聘',
          troops: troops(1320, 180, 500, 0),
          morale: 76,
          fatigue: 0,
          food: 1000,
          loyalty: 84,
          task: '夹击桂阳'
        });
      }
      state.stage = 2;
      state.troopsTurn = gameState.turn;
      state.attitude = '兵临桂阳';
      gameState.characters.kuaiYue.status = state.kuaiYueWarning ? '暗递警讯' : '奉命进军';
      gameState.characters.wenPin.status = '南北夹击';
      createLetter({
        senderId: state.kuaiYueWarning ? 'kuaiYue' : 'liuBiao',
        title: '襄阳兵临',
        body: state.kuaiYueWarning
          ? '蒯越遣人暗告：襄阳兵已出，文聘亦奉命压向桂阳。若要回头，这是最后的缝隙。'
          : '襄阳军旗已至桂阳周边，文聘合兵成势。刘表不再给你留缓冲。',
        critical: true,
        kind: 'liuBiaoBreak',
        meta: { stage: 'troops' },
        choices: [{ id: 'ack', label: '知晓' }]
      });
      reports.push({ tone: 'bad', level: 'critical', text: '襄阳兵临：蒯越率三千襄阳兵压近桂阳，文聘形成南北夹击之势。' });
      return true;
    }

    function startLiuBiaoTotalWar(reports = [], source = 'ultimatumExpired') {
      if (!isStoryMode()) return false;
      const state = gameState.storyFlags.liuBiaoBreak ||= {};
      if (state.stage === 'war' || state.status === 'surrendered') return false;
      state.status = 'war';
      state.stage = 'war';
      state.warTurn = gameState.turn;
      state.attitude = '不死不休';
      gameState.player.independent = true;
      gameState.player.faction = 'player';
      gameState.player.protection = 0;
      gameState.characters.liuBiao.status = '宣布讨逆';
      gameState.characters.liuBiao.order = '讨伐叛逆';
      gameState.characters.liuBiao.trust = 0;
      gameState.characters.kuaiYue.status = state.kuaiYueWarning === false ? '奉命攻桂阳' : '被迫随军';
      gameState.characters.wenPin.status = '奉命讨逆';
      ensureDiplomacyRecord('liubiao').relation = 0;
      ensureDiplomacyRecord('liubiao').pact = '开战';
      setFactionRelation('player', 'liubiao', -95);
      ['changsha', 'jiangxia'].forEach(sourceId => {
        if (!gameState.cities[sourceId] || !isControlledBy('guiyang', 'player')) return;
        if (activeCampaignsTargetingCity('guiyang').some(c => c.faction === 'liubiao' && c.source === sourceId)) return;
        createNpcCampaign({ faction: 'liubiao', source: sourceId, target: 'guiyang', troops: sourceId === 'changsha' ? 1800 : 1200, routeMode: 'official' }, reports);
      });
      createLetter({
        senderId: 'liuBiao',
        title: '全面开战',
        body: '刘表正式宣布你为叛逆，荆州各郡奉州牧之命与你断绝往来。旧日庇护至此消失，只余兵锋相见。',
        critical: true,
        kind: 'liuBiaoBreak',
        meta: { stage: 'war', source },
        choices: [{ id: 'ack', label: '兵来将挡' }]
      });
      reports.push({ tone: 'bad', level: 'critical', text: '全面开战：刘表宣布你为叛逆，荆州各郡对你宣战。刘表态度变为“不死不休”。' });
      return true;
    }

    function processLiuBiaoBreakdown(reports = []) {
      if (!isStoryMode()) return;
      if (gameState.player.protection <= 0 && !liuBiaoBreakState() && !gameState.player.independent) {
        triggerLiuBiaoUltimatum(reports, 'collapse');
      }
      const state = liuBiaoBreakState();
      if (!state || state.status === 'surrendered' || state.status === 'observing' || state.status === 'war' || state.stage === 'war') return;
      const elapsed = gameState.turn - Number(state.startedTurn || gameState.turn);
      if (elapsed >= 2) deployLiuBiaoPressureForces(reports);
      if (elapsed >= 4 && !state.surrendered) startLiuBiaoTotalWar(reports, state.refused ? 'refusedUltimatum' : 'ultimatumExpired');
    }

    function resolveLiuBiaoBreakChoice(letter, choiceId, reports = []) {
      const state = liuBiaoBreakState();
      if (!state) return false;
      if (choiceId === 'surrender' && state.status !== 'war') {
        state.status = 'surrendered';
        state.surrendered = true;
        state.attitude = '暂留体面';
        gameState.player.independent = false;
        gameState.player.faction = 'liubiao';
        gameState.player.protection = 25;
        gameState.characters.liuBiao.status = '暂缓问罪';
        gameState.characters.liuBiao.trust = clamp(Number(gameState.characters.liuBiao.trust || 0) + 12, 0, 100);
        ensureDiplomacyRecord('liubiao').relation = clamp(Number(ensureDiplomacyRecord('liubiao').relation || 0) + 12, 0, 100);
        ensureDiplomacyRecord('liubiao').pact = '自辩待察';
        gameState.armies = (gameState.armies || []).filter(army => !String(army.id || '').startsWith('liubiao_'));
        reports.push({ tone: 'warn', level: 'critical', text: '你选择亲赴襄阳自辩。刘表暂留体面，但桂阳重新处在严密监视之下。' });
        return true;
      }
      if (choiceId === 'refuse') {
        state.refused = true;
        state.attitude = '拒命待讨';
        reports.push({ tone: 'bad', text: '你拒绝赴襄阳自辩。襄阳已将此举视作抗命。' });
        return true;
      }
      return true;
    }

    function declareIndependenceFromLiuBiao() {
      if (!isStoryMode()) return toast('宣告自立只在剧情模式中可用');
      const protection = clamp(Number(gameState.player.protection || 0), 0, 100);
      const reports = [];
      gameState.storyFlags ||= {};
      gameState.storyFlags.voluntarilyBrokeWithLiuBiao = true;
      gameState.player.independent = true;
      gameState.player.faction = 'player';
      gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 6, 0, 100);
      ensureDiplomacyRecord('liubiao').pact = '断绝';
      if (protection > 60) {
        gameState.storyFlags.liuBiaoBreak = {
          status: 'observing',
          source: 'highProtectionIndependence',
          stage: 'observing',
          startedTurn: gameState.turn,
          attitude: '悲痛不解',
          caoSunObserveUntil: gameState.turn + 6
        };
        gameState.characters.liuBiao.status = '悲痛不解';
        gameState.diplomacy.cao.relation = clamp(Number(gameState.diplomacy.cao.relation || 0) + 6, 0, 100);
        gameState.diplomacy.sun ||= { relation: 30, pact: '未接触' };
        gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) + 6, 0, 100);
        setFactionRelation('player', 'liubiao', -35);
        reports.push({ tone: 'warn', level: 'critical', text: '你宣告自立。刘表悲痛不解，天下舆论暂偏向你，曹操与孙权短期内选择观望。' });
        createLetter({
          senderId: 'liuBiao',
          title: '悲痛不解',
          body: '吾以桂阳托你，原望荆南得一屏障，不料你竟先割名分。若你仍知轻重，莫使荆州百姓先受兵祸。',
          critical: true,
          kind: 'liuBiaoBreak',
          meta: { stage: 'observing' },
          choices: [{ id: 'ack', label: '自立已定' }]
        });
      } else if (protection >= 30) {
        triggerLiuBiaoUltimatum(reports, 'activeIndependence');
        gameState.storyFlags.liuBiaoBreak.attitude = '震怒且失望';
      } else {
        gameState.storyFlags.liuBiaoBreak = {
          status: 'war',
          source: 'lowProtectionIndependence',
          stage: 3,
          startedTurn: gameState.turn,
          kuaiYueWarning: false,
          attitude: '早有所料'
        };
        startLiuBiaoTotalWar(reports, 'lowProtectionIndependence');
      }
      reports.forEach(item => pushTurnEvent(item));
      addNews('warn', '你已宣告自立，刘表线进入断绝分支。');
      saveToStorage(false);
      render();
    }

    const CONVERSATION_ACTIONS = {
      talk: { label: '会谈', trust: 3, respect: 2, fear: 0, suspicion: -1 },
      probe: { label: '试探', trust: -1, respect: 1, fear: 0, suspicion: 3 },
      gift: { label: '送礼', trust: 5, respect: 0, fear: 0, suspicion: -1 },
      recruit: { label: '招募', trust: 2, respect: 3, fear: 0, suspicion: 2 },
      ally: { label: '结盟', trust: 3, respect: 2, fear: 0, suspicion: 1 },
      scheme: { label: '谋划', trust: 2, respect: 4, fear: 0, suspicion: 1 },
      threaten: { label: '威胁', trust: -6, respect: 1, fear: 8, suspicion: 6 },
      sowDiscord: { label: '离间', trust: -2, respect: 0, fear: 1, suspicion: 7 },
      promiseOffice: { label: '许诺官职', trust: 4, respect: 1, fear: 0, suspicion: 2 },
      strategy: { label: '共商策略', trust: 2, respect: 4, fear: 0, suspicion: 0 }
    };

    const SPECIAL_EVENT_BLUEPRINTS = {
      night_guiyang: { id: 'night_guiyang', title: '夜访桂阳', level: 'critical', participant: 'guiyangClans', onceOnly: true, minTurn: 2, description: '桂阳豪强深夜来访，言辞恭顺，却句句都在试探你的底线。' },
      liubiao_letter: { id: 'liubiao_letter', title: '刘表来信', level: 'critical', participant: 'liuBiao', onceOnly: true, minTurn: 2, description: '襄阳送来刘表亲笔书信，询问桂阳安抚进展。' },
      scholar_recommendation: { id: 'scholar_recommendation', title: '名士荐才', level: 'critical', participant: 'jingnanGentry', onceOnly: false, minTurn: 3, cooldown: 4, description: '荆南名士提及一位尚未正式露面的地方英才。' },
      advisor_plan: { id: 'advisor_plan', title: '谋士献策', level: 'important', participant: 'kuaiYue', onceOnly: false, minTurn: 4, cooldown: 4, description: '蒯越对荆南局势提出了一条值得留意的判断。' },
      heroes_wine: { id: 'heroes_wine', title: '煮酒论英雄', level: 'critical', participant: 'kuaiYue', onceOnly: true, minTurn: 6, description: '席间谈及天下英雄，对方忽然将话锋转向你的志向。' },
      general_request: { id: 'general_request', title: '将军请战', level: 'important', participant: 'wenPin', onceOnly: false, minTurn: 5, cooldown: 5, description: '文聘认为荆南守备仍有可补之处，请你关注军备。' }
    };

    function isPlayerLiuBiaoLoyalHeirCandidate() {
      if (!isStoryMode()) return false;
      const inputs = getLiuBiaoSuccessionInputs();
      return inputs.loyalLine
        && !inputs.attackedLiuBiao
        && !inputs.voluntarilyBroke
        && inputs.protection >= 80
        && inputs.liuBiaoTrust >= 68
        && inputs.prestige >= 45
        && inputs.legitimacy >= 58
        && inputs.guiyangStable
        && inputs.supportEventCount >= 3
        && inputs.ambition <= 45
        && !inputs.breakCrisis;
    }

    function getLiuBiaoSuccessionInputs() {
      const liuBiao = gameState.characters.liuBiao || {};
      const breakState = liuBiaoBreakState();
      const guiyang = gameState.cities.guiyang || {};
      const lines = redemptionState();
      const loyalActions = gameState.storyFlags?.liuBiaoLoyalActions || {};
      const supportEventCount = [
        Number(loyalActions.report || 0) >= 1,
        Number(loyalActions.loyal || 0) >= 1,
        Number(loyalActions.supplies || 0) >= 1,
        lines.huangZu?.choice === 'redeem',
        ['escort', 'support'].includes(lines.liuQi?.choice),
        ['oath', 'frontier'].includes(lines.wenPin?.choice),
        ['accept', 'promise'].includes(lines.kuaiYue?.choice),
        hasPlotNode(gameState.plotLineStates?.liu_biao, 'lb_1_3'),
        hasPlotNode(gameState.plotLineStates?.liu_biao, 'lb_2_3')
      ].filter(Boolean).length;
      const liuQiProtected = ['escort', 'support'].includes(lines.liuQi?.choice)
        || ['出镇江夏', '公开受援'].includes(gameState.characters.liuQi?.status);
      const caiCompromise = lines.caiMao?.choice === 'bargain'
        || gameState.characters.caiMao?.status === '保族交权';
      const successionIntervened = !!lines.liuQi?.resolved
        || !!lines.caiMao?.resolved
        || !!lines.kuaiYue?.resolved
        || hasPlotNode(gameState.plotLineStates?.liu_biao, 'lb_3_4');
      const conservativeForces = caiCompromise
        || (Number(gameState.characters.caiMao?.suspicion || 0) <= 34 && Number(gameState.characters.jingnanGentry?.suspicion || 0) <= 44)
        || (Number(gameState.characters.caiMao?.suspicion || 0) < Number(gameState.characters.kuaiYue?.trust || 0) - 18);
      const unresolvedCaiMilitaryConflict = Number(gameState.characters.caiMao?.suspicion || 0) >= 62
        && Number(gameState.characters.wenPin?.trust || 0) < 55
        && !lines.caiMao?.resolved
        && !lines.wenPin?.resolved;
      const warPressure = activeCampaignSlotCount() >= Math.max(2, Number(gameState.player.commandSlots || 2) - 1)
        || activeCampaignsTargetingCity('guiyang').length > 0
        || (gameState.factionWarState?.recentWars || []).filter(war => war && gameState.turn - Number(war.turn || 0) <= 6).length >= 2;
      const sonsConflictWorsened = hasPlotNode(gameState.plotLineStates?.liu_biao, 'lb_3_2')
        && Number(gameState.characters.caiMao?.suspicion || 0) >= 58
        && !liuQiProtected
        && !caiCompromise;
      return {
        protection: Number(gameState.player.protection || 0),
        liuBiaoTrust: Number(liuBiao.trust || 0),
        prestige: Number(gameState.player.prestige || 0),
        legitimacy: Number(gameState.player.legitimacy || 0),
        ambition: Number(gameState.player.ambition || 0),
        guiyangStable: Number(guiyang.order || 0) >= 60 && Number(guiyang.publicSupport || 0) >= 55,
        supportEventCount,
        liuQiProtected,
        caiCompromise,
        successionIntervened,
        conservativeForces,
        unresolvedCaiMilitaryConflict,
        warPressure,
        sonsConflictWorsened,
        attackedLiuBiao: !!gameState.storyFlags?.attackedLiuBiao,
        voluntarilyBroke: !!gameState.storyFlags?.voluntarilyBrokeWithLiuBiao,
        loyalLine: !gameState.player.independent && gameState.player.faction === 'liubiao',
        breakCrisis: ['war', 'ultimatum'].includes(String(breakState?.status || '')) || breakState?.stage === 'war'
      };
    }

    function isLiuBiaoWillAmbiguous(inputs) {
      return inputs.protection < 45
        || inputs.breakCrisis
        || inputs.attackedLiuBiao
        || inputs.voluntarilyBroke
        || (inputs.ambition > 58 && inputs.protection < 70)
        || inputs.warPressure
        || inputs.sonsConflictWorsened
        || inputs.unresolvedCaiMilitaryConflict;
    }

    function chooseLiuBiaoHeir() {
      const inputs = getLiuBiaoSuccessionInputs();
      if (isPlayerLiuBiaoLoyalHeirCandidate()) return 'player';
      if (isLiuBiaoWillAmbiguous(inputs)) return 'ambiguous';
      if ((inputs.loyalLine && inputs.protection >= 55 && inputs.prestige < 45) || inputs.liuQiProtected) return 'liuQi';
      if (inputs.caiCompromise || (!inputs.successionIntervened && inputs.conservativeForces)) return 'liuCong';
      if (inputs.protection >= 45 && Number(gameState.characters.kuaiYue?.trust || 0) >= 50 && Number(gameState.characters.caiMao?.suspicion || 0) < 55) return 'liuQi';
      return 'liuCong';
    }

    function liuBiaoHeirName(heir) {
      if (heir === 'player') return gameState.player.name || '你';
      if (heir === 'liuQi') return '刘琦';
      if (heir === 'liuCong') return '刘琮';
      if (heir === 'ambiguous') return '遗命未明';
      return '未定';
    }

    function liuBiaoHeirEnding(heir) {
      if (heir === 'player') return 'player_inherits_jingzhou';
      if (heir === 'liuQi') return 'support_liu_qi';
      if (heir === 'liuCong') return 'recognize_liu_cong';
      if (heir === 'ambiguous') return 'ambiguous_will';
      return 'undecided';
    }

    function getLiuBiaoStageEndingInfo(state) {
      const ending = state?.variables?.liuBiaoEnding || 'undecided';
      const inherited = ending === 'player_inherits_jingzhou';
      const supportedLiuQi = ending === 'support_liu_qi';
      const recognizedLiuCong = ending === 'recognize_liu_cong';
      const ambiguousWill = ending === 'ambiguous_will';
      const independent = ending === 'independent_jingzhou' || gameState.player.independent;
      if (inherited) {
        return {
          name: '忠臣托孤',
          summary: '刘表病逝前将荆州托付给你。襄阳、江陵、江夏、长沙诸郡改奉新主，刘表篇在“奉遗命承州”的格局中阶段结算。',
          next: '后续剧情线可以从荆州新主开局：曹操南征会更重视你，孙权会重新评估江夏水路，刘备入荆也会变成客主关系。'
        };
      }
      if (supportedLiuQi) {
        return {
          name: '刘琦正统',
          summary: '刘表遗命归于刘琦，你保住荆南重臣的位置，并在荆州正统名分下获得继续周旋的空间。刘表篇在“扶弱守名”的格局中阶段结算。',
          next: '后续剧情线可以围绕刘琦、蔡氏和外敌压力展开：你既可辅政，也可在危局中另立新局。'
        };
      }
      if (recognizedLiuCong) {
        return {
          name: '蔡氏刘琮',
          summary: '刘琮在蔡氏拥立下承继荆州，你选择承认襄阳新秩序。刘表篇在“保守继位、暗流未息”的格局中阶段结算。',
          next: '后续剧情线可以接入蔡氏牵制、曹操南下和降曹压力，你需要决定继续忍耐还是趁势改局。'
        };
      }
      if (ambiguousWill) {
        return {
          name: '遗命模糊',
          summary: '刘表病逝前未能留下足以压服诸派的明晰遗命。二子之争、蔡氏与军方裂痕、外部战压一并涌上台面，荆州进入多方争名的危险格局。',
          next: '后续剧情线可以围绕争诏、夺府、辅立或自保展开：你需要先稳住已有领地，再决定是否接管襄阳乱局。'
        };
      }
      if (independent) {
        return {
          name: '荆南自立',
          summary: '刘表身后，荆州名分无法再约束你。你以荆南为根基自立，旧州府秩序与新兴军府正式分道扬镳。',
          next: '后续剧情线可以从独立诸侯开局：襄阳残余、江东水路、曹操南征都会把你视作必须处理的新变量。'
        };
      }
      return {
        name: '襄阳余响',
        summary: '刘表去世后，荆州权力重新洗牌。你的选择已经改变第一阶段格局，但天下棋局尚未终止。',
        next: '后续剧情线可以根据你的城池、民心、人物救赎和外部关系继续展开。'
      };
    }

    function guanduState(state) {
      state.variables.guandu ||= {
        caoScore: 0,
        yuanScore: 0,
        playerStance: '',
        fates: {},
        allianceChoice: '',
        startedAfterLiuBiao: true
      };
      state.variables.guandu.fates ||= {};
      return state.variables.guandu;
    }

    function getGuanduPowerLabel() {
      const totals = cityTotals();
      const cities = controlledCities().length;
      const troops = Number(totals.troops || 0);
      const prestige = Number(gameState.player.prestige || 0);
      const power = cities * 12 + troops / 520 + prestige * 0.7 + Number(gameState.player.legitimacy || 0) * 0.35;
      if (power >= 110) return { key: 'hegemon', label: '足以左右北方胜负' };
      if (power >= 78) return { key: 'strong', label: '足以让曹袁同时顾忌' };
      if (power >= 48) return { key: 'middle', label: '可以作为关键外援' };
      return { key: 'weak', label: '仍需借大势自保' };
    }

    function getGuanduLiuBiaoContext() {
      const conclusion = gameState.storyFlags?.liuBiaoStageConclusion;
      if (conclusion?.name) return conclusion.name;
      const state = gameState.plotLineStates?.liu_biao;
      return getLiuBiaoStageEndingInfo(state).name;
    }

    function guanduBodyFor(senderId) {
      const liuResult = getGuanduLiuBiaoContext();
      const power = getGuanduPowerLabel();
      if (senderId === 'caoCao') {
        if (liuResult === '忠臣托孤') return '曹操密信至：荆州新主既定，许昌不愿北战时再多一名南方敌手。曹操愿以朝廷名义承认你的荆州地位，换你在官渡时牵制袁绍粮道。当前你的势力被评为：' + power.label + '。';
        if (liuResult === '蔡氏刘琮') return '曹操密信至：襄阳保守，荆州未定。曹操暗示若你在官渡时保持善意，日后南下可给你保留体面。当前你的势力被评为：' + power.label + '。';
        if (liuResult === '荆南自立') return '曹操密信至：你既已自立，许昌便按诸侯待你。曹操愿互不相扰，但要求你切断袁绍可能南联之路。当前你的势力被评为：' + power.label + '。';
        return '曹操密信至：北方将决于官渡。许昌不求你立刻出兵，只求你在关键时刻给袁绍添一处破绽。当前你的势力被评为：' + power.label + '。';
      }
      if (liuResult === '忠臣托孤') return '袁绍密信至：袁氏称你既承荆州，便该与河北名门共扶汉室，不可坐视曹操挟天子而专权。当前你的势力被评为：' + power.label + '。';
      if (liuResult === '刘琦正统') return '袁绍密信至：河北愿承认刘琦名分，并请你在荆州南北之间为袁军牵制曹操。当前你的势力被评为：' + power.label + '。';
      if (liuResult === '荆南自立') return '袁绍密信至：袁氏虽不喜你自立，却更忌曹操坐大。若你愿助袁，河北可暂认你的荆南事实。当前你的势力被评为：' + power.label + '。';
      return '袁绍密信至：官渡将定天下归属。袁氏希望你站在河北一边，至少不要让曹操安心南顾。当前你的势力被评为：' + power.label + '。';
    }

    function setCharacterFate(id, status, faction = null, reports = []) {
      const character = gameState.characterRoster?.[id] || gameState.characters?.[id];
      if (!character) return;
      character.status = status;
      if (faction) character.faction = faction;
      if (status === '战死' || status === '处死') character.alive = false;
      reports.push({ tone: status === '战死' || status === '处死' ? 'bad' : 'good', text: character.name + '命运改变：' + status + '。' });
    }

    function revealGuanduFigures() {
      ['caoCao', 'yuanShao', 'liuBei', 'sunQuan', 'xunYu', 'guoJia', 'juShou', 'tianFeng', 'xuYou', 'yanLiang', 'wenChou', 'zhangHe', 'gaoLan'].forEach(id => {
        const character = gameState.characterRoster?.[id];
        if (character && character.status === 'hidden') character.status = 'rumored';
      });
    }

    function getGuanduResultInfo(state) {
      const guandu = guanduState(state);
      const caoScore = Number(guandu.caoScore || 0);
      const yuanScore = Number(guandu.yuanScore || 0);
      if (caoScore >= yuanScore + 4) {
        return {
          name: '曹操逆胜',
          summary: '曹操在官渡以少胜多，袁绍大军崩解。许昌声威暴涨，北方即将进入曹操追亡逐北的阶段。'
        };
      }
      if (yuanScore >= caoScore + 4) {
        return {
          name: '袁绍压胜',
          summary: '袁绍采纳稳进之策，官渡战局压过曹操。许昌震动，历史原本的败局被你推向另一条路。'
        };
      }
      return {
        name: '南北僵持',
        summary: '曹袁在官渡互有胜负，双方都无法彻底吞下对手。你的选择让北方进入更漫长的对峙。'
      };
    }

    function transferJingzhouToPlayerByWill(state) {
      if (state.variables.jingzhouInherited) return;
      state.variables.jingzhouInherited = true;
      gameState.player.independent = true;
      gameState.player.faction = 'player';
      gameState.player.title = '荆州牧';
      gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 18, 0, 100);
      gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 16, 0, 100);
      gameState.player.protection = 0;
      Object.values(gameState.cities || {}).forEach(city => {
        if (!city || isRemovedCityId(city.id)) return;
        const belongsToLiuBiao = city.nominalOwner === 'liubiao'
          || city.owner === 'liubiao'
          || city.faction === 'liubiao'
          || city.controller === 'liubiao'
          || city.actual === 'liubiao';
        if (!belongsToLiuBiao && city.id !== 'guiyang') return;
        captureRegion(city.id, 'player', null, { render: false, select: false, skipProtectionDecay: true, prestige: 0 });
      });
      ['liuBiao', 'liuQi', 'liuCong', 'caiMao', 'kuaiYue', 'huangZu', 'wenPin'].forEach(id => {
        if (gameState.characterRoster?.[id] && gameState.characterRoster[id].faction === 'liubiao') {
          gameState.characterRoster[id].faction = 'player';
        }
      });
      gameState.characters.liuBiao.status = '病逝托孤';
      gameState.characters.kuaiYue.status = '奉遗命辅政';
      gameState.characters.wenPin.status = '奉遗命听调';
      ensureDiplomacyRecord('liubiao').pact = '遗命继承';
      ensureDiplomacyRecord('liubiao').relation = 100;
      setFactionRelation('player', 'liubiao', 100);
      syncMapDataFromGameState();
    }

    function getLiuBiaoBreakStageInfo() {
      const state = liuBiaoBreakState();
      if (!state) return null;
      if (state.status === 'observing') {
        return {
          name: '悲痛不解',
          goal: '剧情目标：稳住自立后的舆论窗口，趁曹操与孙权观望时整理内政和防务。',
          focus: '你已经主动断绝名分，但局势尚未全面翻脸。趁短期观望期补粮、整军、稳定民心。',
          avoid: '不要连续挑衅周边势力，也不要让桂阳治安和粮草失控。',
          next: '观望期结束后，外部势力会重新按实力与敌意判断是否进攻。'
        };
      }
      if (state.stage === 'war' || state.status === 'war') {
        return {
          name: '全面开战',
          goal: '剧情目标：刘表已宣布你为叛逆，优先守住桂阳并击退荆州来攻。',
          focus: '处理紧急战事、补充守军、破坏敌军补给，并准备反攻长沙或江夏。',
          avoid: '不要让主城空虚，也不要忽视围城战役的粮草与士气。',
          next: '击退第一轮攻势后，可以转入独立割据路线。'
        };
      }
      if (Number(state.stage) >= 2) {
        return {
          name: '襄阳兵临',
          goal: '剧情目标：襄阳兵已逼近桂阳，决定是回头自辩，还是准备迎战。',
          focus: '观察蒯越、文聘兵势，补强桂阳城防和士气，必要时处理通牒信件。',
          avoid: '不要把军令点耗尽在无关行动上，也不要继续消耗民心。',
          next: '若不投降，约两回合后会进入全面开战。'
        };
      }
      return {
        name: '最后通牒',
        goal: '剧情目标：刘表发来最后通牒，必须决定是否亲赴襄阳自辩。',
        focus: '尽快处理通牒信。自辩会保留体面；拒绝或拖延会让襄阳出兵。',
        avoid: '不要无视最后通牒太久，否则连锁会继续升级。',
        next: '两回合后会进入“襄阳兵临”。'
      };
    }

    function getLiuBiaoPlotStageInfo(state, node) {
      const breakInfo = getLiuBiaoBreakStageInfo();
      if (breakInfo) return breakInfo;
      if (state?.status === 'completed') {
        const conclusion = state.variables?.stageConclusion || gameState.storyFlags?.liuBiaoStageConclusion || getLiuBiaoStageEndingInfo(state);
        return {
          name: conclusion.name || '阶段结算',
          focus: '刘表篇已经收束，当前重点是整理结算后的城池、人物、外交和防务变化。',
          avoid: '不要把这次弹窗理解为整局终局。它只是刘表篇的阶段结果，后面仍可接新的剧情线。',
          next: conclusion.next || '后续剧情线会根据刘表篇的阶段结果继续展开。'
        };
      }
      const stage = Number(node?.stage || state?.stage || 1);
      if (stage <= 1) {
        return {
          name: '桂阳立足',
          focus: '稳住桂阳的治安、粮草、民心和守军，这是刘表继续信任你的根基。',
          avoid: '不要急着扩张，也不要让治安、粮草或守军明显短板。',
          next: '桂阳站稳后，襄阳会开始观察你扩张后的名义边界。'
        };
      }
      if (stage === 2) {
        return {
          name: '扩张疑云',
          focus: '处理扩张后的名义归属，维持刘表庇护，同时控制声望带来的猜疑。',
          avoid: '不要一边高速扩张一边隐瞒军备，否则庇护会快速流失。',
          next: '声望、城池或庇护变化会把你推向襄阳核心权力询问。'
        };
      }
      if (stage === 3) {
        return {
          name: '荆州内局',
          focus: '应对刘琦、刘琮、蔡氏和蒯越的立场变化，争取荆州士族中间派。',
          avoid: '不要让蔡瑁疑心失控，也不要过早暴露自立野心。',
          next: '约第 50 回合，刘表病重后会进入继承判断。'
        };
      }
      if (stage === 4) {
        return {
          name: '病榻择嗣',
          focus: '若想被刘表指定继承荆州，要保持忠臣路线：刘表庇护 80 以上，未攻打刘表，未主动断绝，声望够高，桂阳治理稳定，并完成足够多救援或表忠事件。',
          avoid: '不要自立、攻打刘表、让庇护崩溃，或让二子之争、蔡氏与军方冲突在战乱压力下失控。',
          next: '刘表遗命公布后，荆州会进入继承余响。'
        };
      }
      return {
        name: '襄阳余响',
        focus: '消化刘表遗命带来的新格局，整理荆州内部关系和下一条天下线。',
        avoid: '不要忽略新继承关系带来的城池、防务和外交变化。',
        next: '“襄阳夜雨”后，刘表篇只做阶段结算，不代表剧情模式终局。后续剧情线可以从此接续。'
      };
    }

    const PLOT_LINE_BLUEPRINTS = {
      liu_biao: {
        id: 'liu_biao',
        title: '刘表线',
        openingGoal: '剧情目标：稳住桂阳，等待襄阳后续来信。',
        completedGoal: '剧情目标：刘表篇已阶段结算，整顿荆州内政、人物关系与边境防务，等待下一条剧情线接续。',
        nodes: [
          { id: 'lb_1_1', stage: 1, title: '密令入匣', minTurn: 1, senderId: 'liuBiao', body: '刘表密令入匣，桂阳名义上仍属荆州，实权却已交到你手中。先稳住治安、粮草与军心，襄阳会继续观察。', goal: '剧情目标：稳定桂阳，治安、粮草、守军缺一不可。', auto: true, cinematic: { src: './assets/opening/miling-ru-xia.mp4', title: '密令入匣' } },
          { id: 'lb_1_2', stage: 1, title: '襄阳来信', minTurn: 5, senderId: 'liuBiao', body: '襄阳问桂阳近日安抚成效。刘表并未催逼扩张，只要你能让地方不乱，这份庇护便仍然有效。', goal: '剧情目标：维持刘表庇护，继续安抚桂阳。', cinematic: { src: './assets/opening/xiangyang-lai-xin.mp4?v=raw-v1', title: '襄阳来信' } },
          { id: 'lb_1_3', stage: 1, title: '蒯越巡视', minTurn: 12, senderId: 'kuaiYue', body: '蒯越奉命巡视桂阳。他看重的不是豪言，而是治安与守军是否足以压住地方。', goal: '剧情目标：向荆州证明桂阳已经可以自守。', cinematic: { src: './assets/opening/kuai-yue-xun-shi.mp4?v=raw-v1', title: '蒯越巡视' }, condition: () => {
            const guiyang = gameState.cities.guiyang;
            return Number(guiyang?.order || 0) >= 60 || realTroops(guiyang?.garrison) >= 500;
          } },
          { id: 'lb_2_1', stage: 2, title: '调令风波', minTurn: 10, senderId: 'liuBiao', body: '你已不止据有桂阳一城，襄阳旧吏开始议论调令边界。有人说你奉命镇守，有人说你正在坐大。', goal: '剧情目标：处理扩张后的名义归属，避免刘表庇护骤降。', condition: () => controlledCities().length >= 2 },
          { id: 'lb_2_2', stage: 2, title: '蔡瑁挑拨', minTurn: 10, senderId: 'caiMao', body: '蔡瑁在襄阳席间暗示：桂阳声望日盛，若无约束，迟早不听州府。此话传到你耳中，分量不轻。', goal: '剧情目标：控制声望带来的猜疑，稳住襄阳关系。', condition: () => Number(gameState.player.prestige || 0) >= 20 && Number(gameState.player.protection || 0) >= 50, onTrigger: state => {
            gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) + 8, 0, 100);
            state.variables.caiMaoHostility = gameState.characters.caiMao.suspicion;
          } },
          { id: 'lb_2_3', stage: 2, title: '江夏求援', minTurn: 10, senderId: 'huangZu', body: '江夏水路不宁，黄祖遣人求援。若你出面，能得荆州军心；若你袖手，也会被看作只顾自家。', goal: '剧情目标：决定是否借江夏求援提升荆州影响。', condition: state => Number(gameState.player.protection || 0) >= 40 && (hasPlotNode(state, 'lb_2_1') || hasPlotNode(state, 'lb_2_2')) },
          { id: 'lb_3_1', stage: 3, title: '襄阳召见', minTurn: 20, senderId: 'liuBiao', body: '襄阳召你入见。你控制的城池、声望或庇护变化，已经让刘表无法继续只把桂阳当作边郡事务。', goal: '剧情目标：准备面对荆州核心权力的询问。', condition: () => controlledCities().length >= 4 || Number(gameState.player.prestige || 0) >= 45 || Number(gameState.player.protection || 0) <= 40 },
          { id: 'lb_3_2', stage: 3, title: '二子之争', minTurn: 20, senderId: 'liuQi', body: '刘琦与刘琮之争渐明。刘琦求外援，蔡氏推刘琮，荆州不再只是刘表一人的荆州。', goal: '剧情目标：判断是否介入刘表二子之争。', cinematic: { src: './assets/opening/er-zi-zhi-zheng.mp4?v=raw-v1', title: '二子之争' }, condition: state => hasPlotNode(state, 'lb_3_1') || gameState.turn >= 28 },
          { id: 'lb_3_3', stage: 3, title: '蔡氏阴谋', minTurn: 20, senderId: 'caiMao', body: '蔡氏势力开始暗中排布人事。你若支持刘琦，蔡瑁必然视你为碍眼之人。', goal: '剧情目标：应对蔡氏敌意，稳住荆州内局。', condition: state => Number(gameState.characters.caiMao?.suspicion || 0) >= 40 || state.variables.supportedLiuQi },
          { id: 'lb_3_4', stage: 3, title: '蒯越站队', minTurn: 20, senderId: 'kuaiYue', body: '蒯越终于表态：荆州要活下去，不能只看宗亲名分，也不能任蔡氏一家遮天。', goal: '剧情目标：争取荆州士族中的中间派。', condition: state => hasPlotNode(state, 'lb_3_3') && turnsSincePlotNode(state, 'lb_3_3') >= 3 },
          { id: 'lb_4_1', stage: 4, title: '刘表病重', minTurn: 50, senderId: 'liuBiao', body: '襄阳传来密报：刘表疾病骤重，州府医官昼夜不离榻前。荆州的秩序开始从中枢松动。', goal: '剧情目标：等待刘表最终遗命。', onTrigger: state => {
            gameState.characters.liuBiao.status = '病重';
            gameState.characters.liuBiao.authority = clamp(Number(gameState.characters.liuBiao.authority || 0) - 20, 0, 100);
            state.variables.liuBiaoIllnessTurn = gameState.turn;
          } },
          { id: 'lb_4_2', stage: 4, title: '病榻择嗣', minTurn: 50, senderId: 'liuBiao', body: state => {
            const heir = state.variables.liuBiaoHeir || 'undecided';
            if (heir === 'player') return '刘表于病榻前召集近臣，明言桂阳之臣能守礼、能安民、能承荆州。他没有把州印交给宗子，而是将荆州托付给你。';
            if (heir === 'liuQi') return '刘表病中留下遗命，命刘琦承接荆州名分，并要诸臣以安民为先。荆州诸派仍有暗流，却暂有名义可循。';
            if (heir === 'liuCong') return '刘表病中留下遗命，承认刘琮继位。蔡氏一门暂掌襄阳，荆州的保守秩序压过了所有变数。';
            return '刘表病榻前几度欲言，州印、宗子、蔡氏与军方各执一辞。庇护已薄，战事压境，二子之争又无定论，遗命终究未能明白压服诸派。';
          }, goal: '剧情目标：等待荆州易主。', cinematic: state => {
            if (state.variables.liuBiaoHeir === 'player') return { src: './assets/opening/zhong-chen-tuo-gu.mp4', title: '忠臣托孤' };
            if (state.variables.liuBiaoHeir === 'liuQi') return { src: './assets/opening/liu-qi-zheng-tong.mp4?v=replace-v3', title: '刘琦正统' };
            if (state.variables.liuBiaoHeir === 'liuCong') return { src: './assets/opening/cai-shi-liu-cong.mp4?v=replace-v2', title: '蔡氏刘琮' };
            if (state.variables.liuBiaoHeir === 'ambiguous') return { src: './assets/opening/yi-ming-mo-hu.mp4', title: '遗命模糊' };
            return null;
          }, condition: state => hasPlotNode(state, 'lb_4_1') && turnsSincePlotNode(state, 'lb_4_1') >= 1, onTrigger: state => {
            const heir = chooseLiuBiaoHeir();
            state.variables.liuBiaoHeir = heir;
            state.variables.liuBiaoHeirName = liuBiaoHeirName(heir);
            state.variables.liuBiaoSuccessionInputs = getLiuBiaoSuccessionInputs();
            gameState.characters.liuBiao.alive = false;
            gameState.characters.liuBiao.status = '病逝';
            gameState.characters.liuBiao.authority = 0;
          } },
          { id: 'lb_4_3', stage: 4, title: '荆州易主', minTurn: 50, senderId: 'liuBiao', body: state => {
            const heir = state.variables.liuBiaoHeir || 'undecided';
            if (heir === 'player') return '州府遗命公布：刘表以荆州托付于你。襄阳、江陵、江夏、长沙诸郡改奉新主，荆州全境归入你的麾下。';
            if (heir === 'liuQi') return '刘表已逝，刘琦承继荆州名分。你仍是荆南重臣，但州府继承不再由你决定。';
            if (heir === 'liuCong') return '刘表已逝，刘琮在蔡氏拥立下承继荆州。襄阳名义暂稳，而新的权力格局将更保守、更猜疑。';
            return '刘表已逝，襄阳未能拿出压服众人的明诏。刘琦、刘琮、蔡氏、军府与外敌压力同时撕扯荆州，州府名分陷入模糊。';
          }, goal: '剧情目标：刘表线进入继承余响。', condition: state => hasPlotNode(state, 'lb_4_2') && turnsSincePlotNode(state, 'lb_4_2') >= 1, onTrigger: state => {
            const heir = state.variables.liuBiaoHeir || chooseLiuBiaoHeir();
            state.variables.liuBiaoHeir = heir;
            state.variables.liuBiaoEnding = liuBiaoHeirEnding(heir);
            state.variables.liuBiaoEndingChoice = 'liuBiaoWill:' + heir;
            state.variables.supportedLiuQi = heir === 'liuQi';
            state.variables.recognizedLiuCong = heir === 'liuCong';
            state.variables.playerInheritedJingzhou = heir === 'player';
            state.variables.ambiguousWill = heir === 'ambiguous';
            if (heir === 'player') transferJingzhouToPlayerByWill(state);
            if (heir === 'liuQi') gameState.characters.kuaiYue.trust = clamp(Number(gameState.characters.kuaiYue.trust || 0) + 8, 0, 100);
            if (heir === 'liuCong') gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) - 8, 0, 100);
            if (heir === 'ambiguous') {
              gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) + 10, 0, 100);
              gameState.characters.wenPin.trust = clamp(Number(gameState.characters.wenPin.trust || 0) - 6, 0, 100);
              gameState.characters.kuaiYue.status = '争诏未定';
              gameState.characters.wenPin.status = '军令观望';
            }
          } },
          { id: 'lb_5_branch', stage: 5, title: '阶段结局', minTurn: 50, senderId: 'kuaiYue', body: state => {
            const info = getLiuBiaoStageEndingInfo(state);
            return '荆州诸人已经看清你的选择。当前刘表篇阶段结果为“' + info.name + '”。这只是第一段剧情线的结算，不是整局游戏终局。';
          }, goal: '剧情目标：等待襄阳夜雨，为刘表篇做阶段收束。', condition: state => !!state.variables.liuBiaoEnding },
          { id: 'lb_5_rain', stage: 5, title: '襄阳夜雨', minTurn: 50, senderId: 'liuBiao', body: state => {
            const info = getLiuBiaoStageEndingInfo(state);
            return '襄阳夜雨落在旧州府瓦上。刘表篇第一阶段结算：' + info.name + '。' + info.summary + ' ' + info.next;
          }, goal: '剧情目标：刘表篇已阶段结算，整理城池、防务与人物关系，等待新的剧情线。', condition: state => hasPlotNode(state, 'lb_5_branch') && turnsSincePlotNode(state, 'lb_5_branch') >= 5, final: true, cinematic: { src: './assets/opening/xiangyang-ye-yu.mp4', title: '襄阳夜雨' }, onTrigger: state => {
            state.variables.stageConclusion = getLiuBiaoStageEndingInfo(state);
            gameState.storyFlags ||= {};
            gameState.storyFlags.liuBiaoStageConclusion = state.variables.stageConclusion;
          } }
        ]
      },
      guandu: {
        id: 'guandu',
        title: '官渡篇',
        openingGoal: '剧情目标：刘表篇之后先休整内政，观察曹操与袁绍的官渡风声。',
        completedGoal: '剧情目标：官渡篇已阶段结算，整理北方战局带来的外交、人物和边境变化。',
        nodes: [
          { id: 'gd_1_rest', stage: 1, title: '战前休整', minTurn: 1, senderId: 'kuaiYue', body: state => {
            revealGuanduFigures();
            const conclusion = getGuanduLiuBiaoContext();
            const power = getGuanduPowerLabel();
            return '刘表篇收束后，荆州暂得喘息。州府旧吏、军府新臣与地方士族都在等待你整顿。北方曹操、袁绍已在官渡相持，而你此刻的阶段结果是“' + conclusion + '”，势力水平是“' + power.label + '”。';
          }, goal: '剧情目标：休整 3 回合，补粮、整军、安民，准备面对曹袁密信。', condition: state => gameState.turn - Number(state.startedTurn || gameState.turn) >= 1, onTrigger: state => {
            const gd = guanduState(state);
            gd.restUntilTurn = gameState.turn + 3;
            gd.liuBiaoContext = getGuanduLiuBiaoContext();
            gd.powerAtStart = getGuanduPowerLabel().key;
          } },
          { id: 'gd_2_cao_letter', stage: 2, title: '许昌密信', minTurn: 1, senderId: 'caoCao', body: () => guanduBodyFor('caoCao'), goal: '剧情目标：决定如何回应曹操，影响官渡曹军胜算与许昌对你的态度。', condition: state => hasPlotNode(state, 'gd_1_rest') && gameState.turn >= Number(guanduState(state).restUntilTurn || 0), choices: [
            { id: 'aidCaoFood', label: '暗助曹操粮道' },
            { id: 'aidCaoIntel', label: '送出袁军情报' },
            { id: 'misleadCao', label: '以假情报误导曹操' },
            { id: 'declineCao', label: '婉拒许昌密信' }
          ] },
          { id: 'gd_2_yuan_letter', stage: 2, title: '邺城密信', minTurn: 1, senderId: 'yuanShao', body: () => guanduBodyFor('yuanShao'), goal: '剧情目标：决定如何回应袁绍，影响官渡袁军胜算与河北人物命运。', condition: state => hasPlotNode(state, 'gd_2_cao_letter') && turnsSincePlotNode(state, 'gd_2_cao_letter') >= 1, choices: [
            { id: 'adviseYuanSlow', label: '劝袁绍缓进耗曹' },
            { id: 'urgeYuanAttack', label: '催袁绍急攻许昌' },
            { id: 'saveTianFeng', label: '为田丰求情' },
            { id: 'declineYuan', label: '不卷入河北军议' }
          ] },
          { id: 'gd_3_alliances', stage: 3, title: '群雄求盟', minTurn: 1, senderId: 'liuBei', body: '官渡相持，天下诸侯都开始寻找后路。刘备希望借你的荆州格局自保，孙权希望稳住江夏水路，曹操与袁绍也各自给出正式盟约的暗示。你只能公开选择一个方向，或保持不结盟。', goal: '剧情目标：选择官渡期间的公开盟友，或维持观望。', condition: state => hasPlotNode(state, 'gd_2_yuan_letter') && turnsSincePlotNode(state, 'gd_2_yuan_letter') >= 2, choices: [
            { id: 'allyLiuBei', label: '与刘备结成仁义盟' },
            { id: 'allySunQuan', label: '与孙权结成江上盟' },
            { id: 'allyCaoCao', label: '与曹操结成许昌盟' },
            { id: 'allyYuanShao', label: '与袁绍结成河北盟' },
            { id: 'noAlliance', label: '暂不公开结盟' }
          ] },
          { id: 'gd_4_baima', stage: 4, title: '白马生死', minTurn: 1, senderId: 'guanYu', body: '白马、延津之间杀气渐浓。颜良、文丑将成为官渡序幕中的第一批命运节点。若你递出一封信、截下一道军令，甚至可以改变他们是否死于此战。', goal: '剧情目标：决定是否介入白马与延津，改变颜良、文丑的命运。', condition: state => hasPlotNode(state, 'gd_3_alliances') && turnsSincePlotNode(state, 'gd_3_alliances') >= 2, choices: [
            { id: 'warnYanLiang', label: '密告颜良谨防关羽' },
            { id: 'letYanLiangDie', label: '任由颜良战死' },
            { id: 'saveWenChou', label: '接应文丑撤军' },
            { id: 'ambushBoth', label: '设伏同时削弱曹袁' }
          ] },
          { id: 'gd_5_wuchao', stage: 5, title: '乌巢夜火', minTurn: 1, senderId: 'xuYou', body: '许攸受辱，乌巢粮屯暴露在夜色里。张郃、高览也在判断袁绍还能不能听进正确的军令。你的一封回信，将决定火是否烧起、谁能活下来、谁会改换门庭。', goal: '剧情目标：在乌巢之夜选择官渡胜负的关键推手。', condition: state => hasPlotNode(state, 'gd_4_baima') && turnsSincePlotNode(state, 'gd_4_baima') >= 2, choices: [
            { id: 'burnWuchao', label: '把乌巢情报交给曹操' },
            { id: 'guardWuchao', label: '提醒袁军严守乌巢' },
            { id: 'interceptXuYou', label: '截下许攸另作筹码' },
            { id: 'recruitZhangHe', label: '暗示张郃另寻明主' }
          ] },
          { id: 'gd_6_result', stage: 6, title: '官渡阶段结算', minTurn: 1, senderId: 'xunYu', body: state => {
            const result = getGuanduResultInfo(state);
            const gd = guanduState(state);
            return '官渡战报传至荆州：' + result.name + '。' + result.summary + ' 人物命运已被记录：' + Object.entries(gd.fates || {}).map(([id, fate]) => id + '：' + fate).join('；') + '。这仍是剧情模式的阶段结算，后续天下线可以继续接入。';
          }, goal: '剧情目标：官渡篇已阶段结算，整理北方胜负与人物去向。', condition: state => hasPlotNode(state, 'gd_5_wuchao') && turnsSincePlotNode(state, 'gd_5_wuchao') >= 2, final: true, onTrigger: state => {
            const result = getGuanduResultInfo(state);
            guanduState(state).result = result;
            gameState.storyFlags ||= {};
            gameState.storyFlags.guanduStageConclusion = result;
          } }
        ]
      }
    };

    function pushTurnEvent(event) {
      const item = Object.assign({ id: uid(), turn: gameState.turn, level: 'minor', tone: 'warn', text: '' }, event);
      gameState.turnEvents.push(item);
      if (item.level !== 'minor') addNews(item.tone, item.text);
      return item;
    }

    function createPlotLineState(lineId) {
      const blueprint = PLOT_LINE_BLUEPRINTS[lineId] || {};
      return {
        id: lineId,
        status: 'inactive',
        stage: 0,
        startedTurn: null,
        completedTurn: null,
        currentNodeId: '',
        triggeredNodes: {},
        variables: {},
        currentGoal: blueprint.openingGoal || ''
      };
    }

    function ensurePlotLineState(lineId) {
      gameState.plotLineStates ||= {};
      gameState.plotLineStates[lineId] ||= createPlotLineState(lineId);
      const state = gameState.plotLineStates[lineId];
      state.id ||= lineId;
      state.status ||= 'inactive';
      state.stage ||= 0;
      state.triggeredNodes ||= {};
      state.variables ||= {};
      state.currentGoal ||= PLOT_LINE_BLUEPRINTS[lineId]?.openingGoal || '';
      return state;
    }

    function ensurePlotLineStateFor(targetState, lineId) {
      if (!targetState) return null;
      targetState.plotLineStates ||= {};
      targetState.plotLineStates[lineId] ||= createPlotLineState(lineId);
      const state = targetState.plotLineStates[lineId];
      state.id ||= lineId;
      state.status ||= 'inactive';
      state.stage ||= 0;
      state.triggeredNodes ||= {};
      state.variables ||= {};
      state.currentGoal ||= PLOT_LINE_BLUEPRINTS[lineId]?.openingGoal || '';
      return state;
    }

    function isStoryMode() {
      return gameState.gameMode === 'story';
    }

    function hasPlotNode(state, nodeId) {
      return !!state?.triggeredNodes?.[nodeId];
    }

    function turnsSincePlotNode(state, nodeId) {
      const turn = Number(state?.triggeredNodes?.[nodeId]?.turn || 0);
      if (!turn) return 999;
      return Math.max(0, gameState.turn - turn);
    }

    function activatePlotLine(lineId) {
      const state = ensurePlotLineState(lineId);
      if (state.status === 'completed') return state;
      if (state.status === 'inactive') {
        state.status = 'active';
        state.startedTurn = gameState.turn;
        state.currentGoal = PLOT_LINE_BLUEPRINTS[lineId]?.openingGoal || state.currentGoal;
      }
      return state;
    }

    function initializePlotLinesForMode(mode) {
      gameState.gameMode = mode === 'story' ? 'story' : 'sandbox';
      gameState.plotLineStates ||= {};
      if (isStoryMode()) {
        activatePlotLine('liu_biao');
      }
    }

    function getActivePlotGoal() {
      if (!isStoryMode()) return '';
      const breakInfo = getLiuBiaoBreakStageInfo();
      if (breakInfo) return '【' + breakInfo.name + '】' + breakInfo.goal.replace(/^剧情目标：/, '');
      const active = Object.values(gameState.plotLineStates || {})
        .filter(state => state && state.status === 'active' && state.currentGoal);
      if (!active.length) {
        const completed = Object.values(gameState.plotLineStates || {})
          .filter(state => state && state.status === 'completed' && state.currentGoal)
          .sort((a, b) => Number(b.completedTurn || 0) - Number(a.completedTurn || 0))[0];
        return completed?.currentGoal || '';
      }
      active.sort((a, b) => Number(b.stage || 0) - Number(a.stage || 0));
      const state = active[0];
      const node = (PLOT_LINE_BLUEPRINTS[state?.id]?.nodes || []).find(item => item.id === state?.currentNodeId);
      const phase = state?.id === 'liu_biao' ? getLiuBiaoPlotStageInfo(state, node) : null;
      const goal = state.currentGoal || '';
      if (!phase) return goal;
      if (goal.includes('【' + phase.name + '】')) return goal;
      return goal.replace(/^剧情目标：/, '【' + phase.name + '】');
    }

    function getSystemRecommendedGoal() {
      const cities = controlledCities();
      const totals = cityTotals();
      const urgent = (gameState.urgentMatters || []).filter(item => !item.resolved);
      if (urgent.length) return '系统推荐：先处理紧急事务，避免城池或战役失控。';
      if (!cities.length) return '系统推荐：夺回一座可治理城池，恢复基本盘。';
      const weakOrder = cities.find(city => Number(city.order || 0) < 45);
      if (weakOrder) return '系统推荐：整顿' + weakOrder.name + '治安，防止民变和征兵效率下降。';
      const weakSupport = cities.find(city => Number(city.publicSupport || 0) < 45);
      if (weakSupport) return '系统推荐：安抚' + weakSupport.name + '民心，稳定税粮与地方响应。';
      if (totals.food < Math.max(2400, totals.troops * 1.2)) return '系统推荐：优先屯田备粮，避免战役补给吃紧。';
      if (activeCampaignSlotCount() > 0) return '系统推荐：关注进行中战役的兵力、粮草与目标城状态。';
      if (cities.length < 3) return '系统推荐：巩固周边，选择一座邻近弱城作为下一步目标。';
      return '系统推荐：发展内政、补充驻军，并寻找合适的外交或进攻窗口。';
    }

    function getDisplayedCurrentGoal() {
      return getActivePlotGoal() || getSystemRecommendedGoal();
    }

    function getCurrentGoalHelpText() {
      const plotGoal = getActivePlotGoal();
      const displayedGoal = getDisplayedCurrentGoal();
      if (plotGoal) {
        const active = Object.values(gameState.plotLineStates || {})
          .filter(state => state && state.status === 'active' && state.currentGoal)
          .sort((a, b) => Number(b.stage || 0) - Number(a.stage || 0))[0]
          || Object.values(gameState.plotLineStates || {})
            .filter(state => state && state.status === 'completed' && state.currentGoal)
            .sort((a, b) => Number(b.completedTurn || 0) - Number(a.completedTurn || 0))[0];
        const lineName = PLOT_LINE_BLUEPRINTS[active?.id]?.title || '剧情线';
        const node = (PLOT_LINE_BLUEPRINTS[active?.id]?.nodes || []).find(item => item.id === active?.currentNodeId);
        const phase = active?.id === 'liu_biao' ? getLiuBiaoPlotStageInfo(active, node) : null;
        return '<strong>当前目标</strong><br>' +
          '这是剧情模式下的阶段任务，来自：' + escapeHtml(lineName) + '。<br>' +
          (phase ? '<span style="color:var(--accent)">当前阶段：</span>' + escapeHtml(phase.name) + '<br>' : '') +
          '<span style="color:var(--good)">现在要做：</span>' + escapeHtml(displayedGoal.replace(/^剧情目标：/, '')) + '<br>' +
          (phase ? '<span style="color:var(--good)">本阶段重点：</span>' + escapeHtml(phase.focus) + '<br>' : '') +
          (phase ? '<span style="color:var(--bad)">需要避免：</span>' + escapeHtml(phase.avoid) + '<br>' : '') +
          (phase ? '<span style="color:var(--muted)">后续变化：</span>' + escapeHtml(phase.next) + '<br>' : '') +
          (node ? '<span style="color:var(--muted)">当前节点：</span>' + escapeHtml(node.title) + '｜阶段 ' + Number(node.stage || active.stage || 0) + '<br>' : '') +
          '<span style="color:var(--bad)">说明：</span>剧情目标只提示方向，不会锁死你的操作；刘表篇结算只是阶段结局，后续剧情线仍可继续接入。';
      }
      return '<strong>当前目标</strong><br>' +
        '这是系统根据当前局势自动给出的建议，用来帮你判断下一步优先级。<br>' +
        '<span style="color:var(--good)">现在要做：</span>' + escapeHtml(displayedGoal.replace(/^系统推荐：/, '')) + '<br>' +
        '<span style="color:var(--bad)">说明：</span>它不是强制任务。你可以自由内政、外交或出兵；当紧急事务、城池状态、粮草、战役或扩张条件变化时，这里会自动更新。';
    }

    function getTurnDateHelpText() {
      if (isGuideActive()) {
        return '<strong>回合 / 日期</strong><br>' +
          '你正在新手引导中：这里显示的是引导回合，用来拆分教学步骤。<br>' +
          '<span style="color:var(--good)">完成引导后，会回到正式回合与历史日期显示。</span><br>' +
          '<span style="color:var(--bad)">说明：</span>引导回合主要服务教学节奏，不代表正式战局已经推进同样天数。';
      }
      return '<strong>回合 / 日期</strong><br>' +
        '当前是第 ' + Number(gameState.turn || 1) + ' 回合，日期为 ' + escapeHtml(formatDate()) + '。<br>' +
        '<span style="color:var(--good)">每次结束回合会结算命令、经济、战役、外交、剧情与势力行动。</span><br>' +
        '<span style="color:var(--muted)">时间规则：</span>每个正式回合推进 ' + TURN_DAYS + ' 天；游戏按 30 天一月、12 月一年滚动。<br>' +
        '<span style="color:var(--bad)">注意：</span>部分剧情会检查回合数或日期窗口，拖延太久可能错过更有利的处理时机。';
    }

    function triggerPlotNode(lineId, node, state, reports = []) {
      if (!node || hasPlotNode(state, node.id)) return false;
      state.triggeredNodes[node.id] = { turn: gameState.turn, title: node.title, stage: node.stage };
      state.stage = Math.max(Number(state.stage || 0), Number(node.stage || 0));
      state.currentNodeId = node.id;
      state.currentGoal = node.goal || state.currentGoal;
      if (node.onTrigger) node.onTrigger(state);
      const nodeBody = typeof node.body === 'function' ? node.body(state) : (node.body || '');

      const title = PLOT_LINE_BLUEPRINTS[lineId]?.title || '剧情线';
      const text = title + '｜' + node.title + '：' + nodeBody;
      reports.push({ tone: node.final ? 'good' : 'warn', level: 'important', text });
      const nodeCinematic = typeof node.cinematic === 'function' ? node.cinematic(state) : node.cinematic;

      createLetter({
        senderId: node.senderId || 'liuBiao',
        title: node.title,
        body: nodeBody || node.title,
        critical: true,
        kind: 'plotEvent',
        meta: Object.assign({ lineId, nodeId: node.id }, nodeCinematic ? { cinematic: nodeCinematic } : {}),
        choices: node.choices || [{ id: 'ack', label: node.final ? '收下阶段结局' : '知晓' }]
      });
      return true;
    }

    function completePlotLine(lineId, state, reports = []) {
      state.status = 'completed';
      state.completedTurn = gameState.turn;
      state.currentGoal = PLOT_LINE_BLUEPRINTS[lineId]?.completedGoal || '';
      if (lineId === 'liu_biao') {
        state.variables.completed = true;
        gameState.currentGoal = state.currentGoal;
        reports.push({ tone: 'good', level: 'critical', text: '刘表篇已阶段结算。这只是当前剧情线的结果，后续剧情线仍可从荆州新格局继续展开。' });
        const guandu = activatePlotLine('guandu');
        guandu.startedTurn = guandu.startedTurn || gameState.turn;
        guandu.currentGoal = PLOT_LINE_BLUEPRINTS.guandu?.openingGoal || guandu.currentGoal;
        reports.push({ tone: 'warn', level: 'important', text: '官渡篇已开启。你将先获得一段休整时间，随后曹操与袁绍会陆续送来密信。' });
      }
      if (lineId === 'guandu') {
        state.variables.completed = true;
        gameState.currentGoal = state.currentGoal;
        reports.push({ tone: 'good', level: 'critical', text: '官渡篇已阶段结算。北方胜负、人物命运与盟约关系已经写入后续剧情基础。' });
      }
    }

    function processPlotLines(reports = []) {
      if (!isStoryMode()) return;
      Object.entries(PLOT_LINE_BLUEPRINTS).forEach(([lineId, blueprint]) => {
        const state = ensurePlotLineState(lineId);
        if (state.status !== 'active') return;
        for (const node of blueprint.nodes || []) {
          if (hasPlotNode(state, node.id)) continue;
          if (gameState.turn < Number(node.minTurn || 1)) continue;
          if (node.condition && !node.condition(state)) continue;
          triggerPlotNode(lineId, node, state, reports);
          break;
        }
      });
    }

    function resolvePlotEventChoice(letter, choiceId, reports = []) {
      const lineId = letter?.meta?.lineId;
      const nodeId = letter?.meta?.nodeId;
      if (!lineId || !nodeId) return false;
      const state = ensurePlotLineState(lineId);
      const node = (PLOT_LINE_BLUEPRINTS[lineId]?.nodes || []).find(item => item.id === nodeId);
      if (lineId === 'guandu') {
        resolveGuanduPlotChoice(state, nodeId, choiceId, reports);
      }
      if (lineId === 'liu_biao' && nodeId === 'lb_4_3') {
        const endings = {
          supportLiuQi: 'support_liu_qi',
          recognizeLiuCong: 'recognize_liu_cong',
          standIndependent: 'independent_jingzhou'
        };
        if (state.variables.liuBiaoHeir && !endings[choiceId]) {
          return true;
        }
        state.variables.liuBiaoEnding = endings[choiceId] || 'undecided';
        state.variables.liuBiaoEndingChoice = choiceId;
        state.variables.supportedLiuQi = choiceId === 'supportLiuQi';
        state.variables.recognizedLiuCong = choiceId === 'recognizeLiuCong';
        state.variables.playerIndependentAtEnding = choiceId === 'standIndependent';
        if (choiceId === 'supportLiuQi') {
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 8, 0, 100);
          gameState.characters.kuaiYue.trust = clamp(Number(gameState.characters.kuaiYue.trust || 0) + 8, 0, 100);
          reports.push({ tone: 'good', text: '你选择扶刘琦守荆州，合法性上升，蒯越更愿与你合作。' });
        } else if (choiceId === 'recognizeLiuCong') {
          gameState.player.protection = clamp(Number(gameState.player.protection || 0) + 5, 0, 100);
          gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) - 6, 0, 100);
          reports.push({ tone: 'warn', text: '你承认刘琮继位，襄阳名义暂稳，但未来曹操线可据此生成更保守的开局。' });
        } else if (choiceId === 'standIndependent') {
          gameState.player.independent = true;
          gameState.player.ambition = clamp(Number(gameState.player.ambition || 0) + 12, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 6, 0, 100);
          reports.push({ tone: 'bad', text: '你趁乱自立，声望与野心上升，但后续剧情线会把你视作荆州新变量。' });
        }
      }
      if (node?.final) {
        completePlotLine(lineId, state, reports);
      }
      return true;
    }

    function addCharacterMemory(character, memory) {
      if (memory && typeof memory.summary === 'string') {
        memory.summary = repairDisplayText(memory.summary);
      }
      character.memory.unshift(Object.assign({ turn: gameState.turn }, memory));
      character.memory = character.memory.slice(0, 18);
    }

    function hashText(text) {
      return String(text || '').split('').reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
    }

    function pickByNpcSeed(npc, key, lines) {
      const pool = lines.filter(Boolean);
      if (!pool.length) return '';
      const seed = hashText([npc.id, key, gameState?.turn || 0, npc.memory?.length || 0, Math.floor((npc.trustPlayer || 0) / 10)].join('|'));
      return pool[seed % pool.length];
    }

    function getNpcStrategicContext(npc) {
      const state = typeof gameState !== 'undefined' ? gameState : null;
      const guiyang = state?.cities?.guiyang || {};
      return {
        turn: state?.turn || 1,
        protection: clamp(state?.player?.protection ?? 60, 0, 100),
        ambition: clamp(state?.player?.ambition ?? 20, 0, 100),
        prestige: clamp(state?.player?.prestige ?? 0, 0, 100),
        citySupport: clamp(guiyang.publicSupport ?? 55, 0, 100),
        cityOrder: clamp(guiyang.order ?? 55, 0, 100),
        foodPressure: Number(guiyang.food || 0) < Math.max(900, Number(guiyang.population || 0) / 35),
        activeCampaigns: state?.campaigns?.filter(isActiveCampaign).length || 0,
        playerName: state?.player?.name || '主公'
      };
    }

    function getNpcMemoryProfile(npc) {
      const recent = (npc.memory || []).slice(0, 8);
      let warmth = 0;
      let wounds = 0;
      let pressure = 0;
      let opportunism = 0;
      recent.forEach(memory => {
        const effects = memory.effects || {};
        warmth += Math.max(0, Number(effects.trustPlayer || 0)) + Math.max(0, Number(effects.respectPlayer || 0));
        wounds += Math.max(0, -Number(effects.trustPlayer || 0)) + Math.max(0, Number(effects.suspicionOfPlayer || 0));
        pressure += Math.max(0, Number(effects.fearPlayer || 0));
        if (['gift', 'promiseOffice', 'ally'].includes(memory.type)) opportunism += 1;
      });
      const last = recent[0];
      const repeatedType = recent.length >= 2 && recent[0].type === recent[1].type ? recent[0].type : '';
      return {
        recent,
        last,
        warmth,
        wounds,
        pressure,
        opportunism,
        repeatedType,
        lastSummary: last?.summary || '',
        hasThreatMemory: recent.some(memory => memory.type === 'threaten'),
        hasGiftMemory: recent.some(memory => memory.type === 'gift' || memory.type === 'promiseOffice')
      };
    }

    function getNpcAttitudeLabel(npc, memoryProfile = getNpcMemoryProfile(npc)) {
      if (npc.trustPlayer >= 70 && npc.respectPlayer >= 58 && npc.suspicionOfPlayer <= 32) return '愿意靠近';
      if (npc.respectPlayer >= 68 && npc.suspicionOfPlayer <= 48) return '敬而观之';
      if (npc.fearPlayer >= 58 && npc.trustPlayer < 48) return '受压戒备';
      if (npc.suspicionOfPlayer >= 64) return '深怀疑虑';
      if (memoryProfile.wounds > memoryProfile.warmth + 5) return '记着旧账';
      if (npc.trustPlayer >= 55) return '试探信任';
      return '观望';
    }

    function buildNpcDialoguePersona(npc) {
      return {
        id: npc.id,
        name: npc.name,
        role: npc.role,
        values: npc.values,
        boundaries: npc.boundaries,
        longTermGoal: npc.longTermGoal,
        privateAgenda: npc.privateAgenda,
        speechStyle: npc.speechStyle,
        currentPlan: npc.currentPlan,
        attitude: getNpcAttitudeLabel(npc),
        memoryProfile: getNpcMemoryProfile(npc)
      };
    }

    function generateNpcCurrentPlan(npc) {
      const ctx = getNpcStrategicContext(npc);
      const attitude = getNpcAttitudeLabel(npc);
      if (npc.id === 'liuBiao') {
        if (ctx.protection < 55) return '准备收紧对桂阳的授权，要求你用政绩重新证明忠诚。';
        if (ctx.ambition >= 55) return '表面继续庇护，暗中观察你是否有脱离荆州的苗头。';
        return '维持庇护，同时要求桂阳稳住民心与豪强。';
      }
      if (npc.id === 'caiMao') {
        return ctx.ambition >= 45 || npc.suspicionOfPlayer >= 58
          ? '联络襄阳士族，准备限制桂阳向军权伸手。'
          : '暂不翻脸，继续查探你在荆南的人脉。';
      }
      if (npc.id === 'kuaiYue') {
        if (npc.respectPlayer >= 62) return '整理一套荆南缓进之策，等待你主动询问代价。';
        return '继续旁观你的用人和治政，寻找值得押注的信号。';
      }
      if (npc.id === 'wenPin') {
        return ctx.activeCampaigns > 0 ? '关注战役后勤，准备提醒你守住军令和粮道。' : '催促桂阳建立更清楚的军备秩序。';
      }
      if (npc.id === 'guiyangClans') {
        if (ctx.cityOrder < 45 || npc.fearPlayer >= 48) return '暂时低头，私下评估是否要联合乡里自保。';
        return '以乡里安定为名，试图换取族产和旧例的余地。';
      }
      if (npc.id === 'jingnanGentry') {
        return ctx.prestige >= 18 && npc.trustPlayer >= 48
          ? '考虑用荐才和清议为你背书，但仍要看你是否守信。'
          : '维持礼貌距离，继续观察桂阳风评。';
      }
      if (npc.id === 'localOfficials') {
        return ctx.cityOrder < 50 ? '准备递交府衙旧弊清单，求一个能落地的章程。' : '整理账册和旧例，避免在新政中被豪强拖下水。';
      }
      if (npc.faction === 'player') {
        if (attitude === '记着旧账') return '表面听令，心里等你补一个交代。';
        return '寻找能证明自己价值的差事。';
      }
      if (npc.suspicionOfPlayer >= 62) return '保留筹码，不急着与你深谈。';
      if (npc.trustPlayer >= 62) return '寻找一次能把合作落到实处的机会。';
      return npc.longTermGoal || '继续观察局势。';
    }

    function refreshNpcPlan(npc) {
      npc.currentPlan = generateNpcCurrentPlan(npc);
      if (npc.npcAgency) {
        npc.npcAgency.shortTermPlan = npc.currentPlan;
        npc.npcAgency.lastPlanTurn = gameState.turn;
        // Stance-based plan refinement
        const stance = npc.npcAgency.relationshipStance;
        const stancePlanPrefix = {
          ally: '愿意提供建议或协助：',
          supportive: '愿意提供建议或协助：',
          suspicious: '继续观察，减少承诺：',
          fearful: '表面顺从，内心戒备：',
          hostile: '保留筹码，降低合作：',
          respectfulButDistant: '愿意承认能力，但不轻易靠近：',
          neutral: ''
        };
        if (stancePlanPrefix[stance] && !npc.currentPlan.startsWith(stancePlanPrefix[stance])) {
          npc.currentPlan = stancePlanPrefix[stance] + npc.currentPlan;
          npc.npcAgency.shortTermPlan = npc.currentPlan;
        }
      }
      return npc.currentPlan;
    }

    function getNpcSignatureOpening(npc, conversationType, attitude) {
      const style = npc.speechStyle || {};
      const linesByNpc = {
        liuBiao: ['荆州如舟，桂阳是舵旁的一枚小钉，小钉松了，整船都要晃。', '卿在桂阳所行，襄阳未必句句过问，却不能不看后果。'],
        caiMao: ['荆州军政自有门墙，不是谁握了几日印绶就能改规矩。', '礼数我认，兵符我也认；至于人心，还要看你守不守分寸。'],
        kuaiYue: ['话不必急着说满，先看你愿意把哪条退路留给自己。', '谋事像下棋，最怕只看眼前一手。'],
        huangZu: ['虚话少些，先说兵粮、路口和谁来担责。', '江夏风浪大，空口许诺压不住船头。'],
        wenPin: ['军令要清，期限要明；若这两样没有，话说再好也散。', '我听的不是漂亮话，是你下一道令之后能不能兑现。'],
        guiyangClans: ['乡里人求的不过是祖坟田界能安稳，官府若逼得太急，草木也会扎手。', '主官说的是大义，乡里记的是谁家谷仓被开过。'],
        jingnanGentry: ['士林不怕新主，怕的是新主轻诺寡信。', '清议虽轻，传到郡县之间，也能压弯许多人的腰。'],
        localOfficials: ['小吏不敢谈大势，只敢说账册上哪一笔会出事。', '府衙旧例不全是好东西，但全拆了也没人知道明日怎么办。']
      };
      const generic = [
        style.habit ? style.habit + '。' : '',
        attitude === '愿意靠近' ? '这次我愿意把话说得更明白些。' : '',
        attitude === '深怀疑虑' ? '有些话我仍要留三分。' : '',
        '此事我会按自己的利害来判断。'
      ];
      return pickByNpcSeed(npc, 'opening:' + conversationType + ':' + attitude, (linesByNpc[npc.id] || []).concat(generic));
    }

    function getNpcActionLine(npc, conversationType, attitude, memoryProfile) {
      const plan = refreshNpcPlan(npc);
      const lines = {
        talk: [
          '若只是寒暄，我会听；若要谈合作，就得把底线说清。',
          '我现在最在意的是：你下一步会先稳人心，还是先扩权。',
          '你前几次留下的印象还在，我不会只凭这一句话改判断。'
        ],
        probe: [
          npc.personality.cautious >= 58 ? '试探可以，但问得太急，只会让我把门关得更紧。' : '你要探我的底，我也正好看看你敢不敢把话挑明。',
          memoryProfile.hasThreatMemory ? '上次威压的痕迹还在，今日再试探，味道就不一样了。' : '',
          '我能说的只有一半，另一半要看你怎么走。'
        ],
        gift: [
          npc.personality.greedy >= 55 ? '礼我收下，情分记一半，另一半还要看事成不成。' : '礼物能润开话头，却买不走我的判断。',
          npc.personality.proud >= 58 ? '若把礼当作驯服人的绳索，那就轻看我了。' : '',
          '今日这份心意，会被记进我对你的账里。'
        ],
        recruit: [
          npc.trustPlayer >= npc.recruitmentDifficulty ? '若你真能给我位置和余地，我可以把下一步押在桂阳。' : '现在要我归附还早，我要看的不是名位，是你能否守住承诺。',
          npc.faction === 'player' ? '我已在你麾下，真正要问的是你打算怎样用我。' : '',
          '招募不是收一枚棋子，是接下一个人的利害。'
        ],
        ally: [
          '结盟可以，但盟约不能只让一边冒险。',
          '若要同舟，先说清风浪来时谁掌舵，谁补船。',
          attitude === '深怀疑虑' ? '我还没看见足够的信用，盟字不能轻落。' : ''
        ],
        scheme: [
          '计策可行，但我更在意失败后谁来收拾残局。',
          '这事若动手，必须同时准备明线、暗线和退路。',
          npc.personality.ruthless >= 55 ? '若真要做，就不要留下半截尾巴。' : ''
        ],
        threaten: [
          npc.personality.proud >= 58 ? '威势压得住一时，压不住我心里的账。' : '我听见威胁了，也会按威胁重新估量你。',
          '你可以让我害怕，但害怕未必会变成忠诚。',
          '这句话会留下痕迹，日后谈什么都绕不过它。'
        ],
        sowDiscord: [
          '离间像火，烧别人屋梁时也会照亮你自己的手。',
          '我可以听这些话，但不会替你背这个名声。',
          '若要用流言，就先想好流言回头咬人时怎么办。'
        ],
        promiseOffice: [
          npc.stats.ambition >= 58 ? '名位有用，但我更看重你能不能兑现。' : '官职不是无用，只是不能替代信义。',
          '空诺许得越高，日后摔得越重。',
          memoryProfile.hasGiftMemory ? '你已经不止一次用好处开路，我会记得，也会防着。' : ''
        ],
        strategy: [
          '若谈策略，就不要只谈胜算，也要谈代价。',
          '我赞成先稳住一处，再让另一处自己露出破绽。',
          '这一步若和我的长远打算相合，我会更愿意出力。'
        ]
      };
      const chosen = pickByNpcSeed(npc, 'action:' + conversationType + ':' + attitude, lines[conversationType] || lines.talk);
      return chosen + ' 眼下我的打算是：' + plan;
    }

    function getNpcMemoryLine(npc, memoryProfile) {
      if (!memoryProfile.last) return '我们之间还没有多少旧账，所以今日的话分量会格外重。';
      if (memoryProfile.hasThreatMemory && npc.fearPlayer >= 35) return '你曾经用过威势，这让我会把每个承诺都多称一遍。';
      if (memoryProfile.warmth > memoryProfile.wounds + 4) return '此前几次接触让气氛松了些，但还没到可以不谈条件的时候。';
      if (memoryProfile.wounds > memoryProfile.warmth + 4) return '旧话没有散，我还记得哪些地方让我不安。';
      return '上一次的事我记着，今日先看你是否仍是同一个态度。';
    }

    function generateFallbackDialogue(context) {
      const npc = context.npc;
      const action = CONVERSATION_ACTIONS[context.conversationType] || CONVERSATION_ACTIONS.talk;
      const memoryProfile = getNpcMemoryProfile(npc);
      const attitude = getNpcAttitudeLabel(npc, memoryProfile);
      const opening = getNpcSignatureOpening(npc, context.conversationType, attitude);
      const actionLine = getNpcActionLine(npc, context.conversationType, attitude, memoryProfile);
      const memoryLine = getNpcMemoryLine(npc, memoryProfile);

      const intentMap = {
        talk: '重新校准彼此的底线',
        probe: '守住秘密并反向试探你',
        gift: '衡量这份好处是否值得欠情',
        recruit: npc.trustPlayer >= (npc.recruitmentDifficulty || 50) ? '决定是否把前途押给你' : '拖延归附并继续观察',
        ally: '争取对自己有利的盟约边界',
        scheme: '确认计策的收益、代价和退路',
        threaten: '在恐惧与反感之间重新评估你',
        sowDiscord: '判断流言是否会反噬自身',
        promiseOffice: '考验你的承诺是否有兑现能力',
        strategy: '把自己的长远打算嵌入你的战略'
      };
      const dialogueParts = [opening, actionLine, memoryLine].filter(Boolean);
      return {
        npcText: dialogueParts.join(' '),
        npcIntent: intentMap[context.conversationType] || action.label,
        emotionalShift: attitude,
        memorySummary: npc.name + '把这次"' + action.label + '"记为：' + (intentMap[context.conversationType] || '继续判断你的分寸') + '。',
        suggestedPlayerChoices: ['顺着其目标继续谈', '触碰其底线试探', '暂时收束承诺']
      };
    }

    function normalizeDialogueResult(result, fallback) {
      const source = result && typeof result === 'object' ? result : {};
      return {
        npcText: escapeHtml(String(source.npcText || fallback.npcText)),
        npcIntent: escapeHtml(String(source.npcIntent || fallback.npcIntent)),
        emotionalShift: escapeHtml(String(source.emotionalShift || fallback.emotionalShift)),
        memorySummary: repairDisplayText(String(source.memorySummary || fallback.memorySummary)),
        suggestedPlayerChoices: Array.isArray(source.suggestedPlayerChoices) ? source.suggestedPlayerChoices.slice(0, 4) : fallback.suggestedPlayerChoices
      };
    }

    async function generateNpcDialogue(context) {
      const fallback = context.conversationType === 'solicitLord'
        ? generateLordSolicitationFallback(context)
        : generateFallbackDialogue(context);
      try {
        if (window.USE_REMOTE_LLM && window.remoteLLMAdapter?.generateNpcDialogue) {
          const remote = await Promise.race([
            window.remoteLLMAdapter.generateNpcDialogue(context),
            new Promise((_, reject) => setTimeout(() => reject(new Error('dialogue timeout')), 6500))
          ]);
          return normalizeDialogueResult(remote, fallback);
        }
      } catch (error) {
        console.warn('Remote dialogue failed, using fallback:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 180));
      return normalizeDialogueResult(fallback, fallback);
    }

    function calculateConversationEffects(npc, conversationType, action) {
      const effects = {
        trustPlayer: Number(action.trust || 0),
        respectPlayer: Number(action.respect || 0),
        fearPlayer: Number(action.fear || 0),
        suspicionOfPlayer: Number(action.suspicion || 0),
        loyalty: 0,
        ambition: 0
      };
      const recent = getNpcMemoryProfile(npc);
      if (conversationType === 'gift') {
        if (npc.personality.greedy >= 55) effects.trustPlayer += 3;
        if (npc.personality.proud >= 58) effects.suspicionOfPlayer += 1;
      }
      if (conversationType === 'probe' && npc.personality.cautious >= 56) {
        effects.suspicionOfPlayer += 2;
        effects.trustPlayer -= 1;
      }
      if (conversationType === 'threaten') {
        if (npc.personality.proud >= 55) {
          effects.trustPlayer -= 3;
          effects.suspicionOfPlayer += 2;
        }
        if (npc.personality.brave <= 36) effects.fearPlayer += 2;
      }
      if (conversationType === 'promiseOffice') {
        if (npc.stats.ambition >= 58) effects.trustPlayer += 2;
        else effects.suspicionOfPlayer += 1;
      }
      if (conversationType === 'strategy' && npc.stats.strategy >= 65) {
        effects.respectPlayer += 2;
      }
      if (conversationType === 'recruit' && npc.trustPlayer >= npc.recruitmentDifficulty) {
        effects.loyalty = 5;
      }
      if (recent.repeatedType === conversationType) {
        effects.suspicionOfPlayer += ['gift', 'promiseOffice', 'threaten', 'sowDiscord'].includes(conversationType) ? 2 : 1;
      }
      if (recent.hasThreatMemory && ['gift', 'promiseOffice'].includes(conversationType)) {
        effects.trustPlayer -= 1;
        effects.suspicionOfPlayer += 1;
      }
      return effects;
    }

    function updateNpcAttitudeToPlayer(npc) {
      const factionBonus = npc.faction === 'player' ? 8 : 0;
      npc.attitudeToPlayer = clamp(Math.round(
        npc.trustPlayer * 0.42 +
        npc.respectPlayer * 0.32 +
        npc.fearPlayer * 0.08 -
        npc.suspicionOfPlayer * 0.26 +
        factionBonus
      ), 0, 100);
      return npc.attitudeToPlayer;
    }

    function updateNpcRelationshipStance(npc) {
      if (!npc || !npc.npcAgency) return;
      const t = npc.trustPlayer || 0;
      const s = npc.suspicionOfPlayer || 0;
      const f = npc.fearPlayer || 0;
      const r = npc.respectPlayer || 0;
      // Order: ally → hostile → fearful → suspicious → respectfulButDistant → supportive → neutral
      if (t >= 75 && s <= 25) {
        npc.npcAgency.relationshipStance = 'ally';
      } else if (t <= 25 && s >= 60) {
        npc.npcAgency.relationshipStance = 'hostile';
      } else if (f >= 65 && t < 45) {
        npc.npcAgency.relationshipStance = 'fearful';
      } else if (s >= 70) {
        npc.npcAgency.relationshipStance = 'suspicious';
      } else if (r >= 70 && t < 45) {
        npc.npcAgency.relationshipStance = 'respectfulButDistant';
      } else if (t >= 55 && r >= 55 && s < 60) {
        npc.npcAgency.relationshipStance = 'supportive';
      } else {
        npc.npcAgency.relationshipStance = 'neutral';
      }
      return npc.npcAgency.relationshipStance;
    }

    function applyConversationResult(context, dialogue) {
      const npc = context.npc;
      const convType = context.conversationType;
      if (convType === 'recruit' && isFactionLordCharacter(npc)) {
        const action = CONVERSATION_ACTIONS[convType] || CONVERSATION_ACTIONS.talk;
        addCharacterMemory(npc, {
          turn: gameState.turn,
          type: convType,
          summary: npc.name + '是一方主公，不会以普通人才身份被招募。',
          playerTone: action.label,
          npcReaction: '拒绝普通招募',
          planAfter: npc.currentPlan,
          effects: {}
        });
        pushTurnEvent({ level: 'minor', tone: 'warn', text: npc.name + '是一方主公，不会以普通人才身份被招募。' });
        return {};
      }
      const action = CONVERSATION_ACTIONS[convType] || CONVERSATION_ACTIONS.talk;
      const effects = calculateConversationEffects(npc, convType, action);
      npc.trustPlayer = clamp(npc.trustPlayer + effects.trustPlayer, 0, 100);
      npc.respectPlayer = clamp(npc.respectPlayer + effects.respectPlayer, 0, 100);
      npc.fearPlayer = clamp(npc.fearPlayer + effects.fearPlayer, 0, 100);
      npc.suspicionOfPlayer = clamp(npc.suspicionOfPlayer + effects.suspicionOfPlayer, 0, 100);
      npc.stats.loyalty = clamp(npc.stats.loyalty + effects.loyalty, 0, 100);
      // Sync npcAgency
      if (npc.npcAgency) {
        npc.npcAgency.lastPlayerReply = {
          turn: gameState.turn,
          conversationType: convType,
          label: action.label,
          delta: { trust: effects.trustPlayer, suspicion: effects.suspicionOfPlayer, fear: effects.fearPlayer, respect: effects.respectPlayer }
        };
        if (convType === 'promiseOffice') {
          npc.npcAgency.unresolvedPromise = { turn: gameState.turn, source: 'conversation', summary: '玩家许诺官职', resolved: false };
        }
        if (convType === 'threaten' || convType === 'sowDiscord') {
          npc.npcAgency.grievance = { turn: gameState.turn, source: 'conversation', summary: convType === 'threaten' ? '受到威胁，心存怨念' : '遭到离间，心生不满', resolved: false };
        }
        if (convType === 'gift') {
          npc.npcAgency.favor = { turn: gameState.turn, source: 'conversation', summary: '收到礼物，记着恩惠', resolved: false };
        }
        if (convType === 'talk' || convType === 'strategy') {
          npc.npcAgency.currentDesire = convType === 'strategy' ? '期待共商策略' : '希望继续会谈';
        }
      }
      updateNpcAttitudeToPlayer(npc);
      updateNpcRelationshipStance(npc);
      if (convType === 'recruit' && npc.trustPlayer >= npc.recruitmentDifficulty && npc.status !== 'recruited') {
        npc.status = 'recruited';
        npc.faction = 'player';
        npc.recruitedBy = gameState.player.name;
      }
      refreshNpcPlan(npc);
      const memory = { turn: gameState.turn, type: convType, summary: dialogue.memorySummary, playerTone: action.label, npcReaction: dialogue.emotionalShift, planAfter: npc.currentPlan, effects };
      addCharacterMemory(npc, memory);
      gameState.conversations.unshift({ characterId: npc.id, ...memory });
      gameState.conversations = gameState.conversations.slice(0, 80);
      pushTurnEvent({ level: 'minor', tone: action.trust >= 0 ? 'good' : 'warn', text: npc.name + '：' + repairDisplayText(dialogue.memorySummary) });
      return effects;
    }

    async function startNpcConversation(characterId, conversationType) {
      if (isInternalPlayerCharacterId(characterId)) {
        return toast('这是你的内部班底，不属于可会谈人物');
      }
      const npc = gameState.characterRoster[characterId];
      if (!npc || ['hidden', 'rumored', 'dead', 'captured'].includes(npc.status)) return toast('此人暂时无法接触');
      if (conversationType === 'ally' && isFactionLordCharacter(npc)) {
        return handleLordAlliance(characterId);
      }
      if (conversationType === 'recruit' && isFactionLordCharacter(npc)) {
        return toast('此人是一方主公，不能普通招募。需在实力压倒对方后尝试“招揽”。');
      }
      if (!spendPoint('dip')) return;
      gameState.selectedCharacterId = characterId;
      gameState.activeModal = { type: 'dialogue', characterId, conversationType, loading: true };
      renderModal();
      const dialogue = await generateNpcDialogue({ npc, player: gameState.player, gameState, conversationType });
      const effects = applyConversationResult({ npc, conversationType }, dialogue);
      gameState.activeModal = { type: 'dialogue', characterId, conversationType, loading: false, dialogue, effects };
      saveToStorage(false);
      render();
    }

    function buildLordSolicitationContext(npc, eligibility) {
      return {
        conversationType: 'solicitLord',
        mode: 'lordSolicitation',
        instruction: '这是对一方主公的招揽，不是普通人才招募。目标拥有自己的势力、尊严、旧部和政治立场。请写出主公面对强势玩家时的试探、权衡、保留条件或归附姿态。',
        npc: {
          id: npc.id,
          name: npc.name,
          faction: npc.faction,
          lordOfFaction: npc.lordOfFaction,
          title: npc.lordTitle || npc.title,
          personality: npc.personality,
          values: npc.values,
          speechStyle: npc.speechStyle
        },
        relationship: {
          trust: npc.trustPlayer,
          respect: npc.respectPlayer,
          fear: npc.fearPlayer,
          suspicion: npc.suspicionOfPlayer,
          stance: npc.npcAgency?.relationshipStance || ''
        },
        powerComparison: {
          playerTroops: eligibility.playerTroops,
          targetTroops: eligibility.targetTroops,
          playerPublic: eligibility.playerPublic,
          targetPublic: eligibility.targetPublic,
          playerCityCount: eligibility.playerCityCount,
          targetCityCount: eligibility.targetCityCount
        },
        player: {
          name: gameState.player?.name,
          title: gameState.player?.title,
          independent: !!gameState.player?.independent,
          protection: gameState.player?.protection,
          cityCount: controlledCities().length
        },
        recentEvents: (gameState.turnEvents || []).slice(-4).map(e => e.text),
        recentMemory: (npc.memory || []).slice(0, 5)
      };
    }

    function generateLordSolicitationFallback(context) {
      const npc = context.npc;
      const rel = context.relationship || {};
      const cautious = Number(rel.suspicion || 0) > 60;
      const fearful = Number(rel.fear || 0) > 65;
      const respectful = Number(rel.respect || 0) > 65;
      let text = '';
      if (fearful) {
        text = npc.name + '沉吟良久，道：“你兵威既盛，民心亦归，我若仍执一隅，恐误旧部与百姓。但归附之事，非一言可决。”';
      } else if (respectful) {
        text = npc.name + '拱手道：“阁下能以兵威定乱，又能得民心，此非寻常郡守可比。若要我等共奉大局，须先明旧部安置与名分。”';
      } else if (cautious) {
        text = npc.name + '缓缓说道：“你今日来谈招揽，所图不小。我虽见你势盛，却也要看你是否容得下旧臣、旧土与旧名。”';
      } else {
        text = npc.name + '说道：“天下无定主，强者未必能久，得民心者方可言大业。若你真能护我旧部百姓，我未必不可与你共议后事。”';
      }
      return {
        npcText: text,
        tone: fearful ? 'fearful' : cautious ? 'cautious' : 'measured',
        emotionalShift: fearful ? '畏服权衡' : cautious ? '谨慎试探' : '审势而谈',
        npcIntent: '权衡是否归附玩家主导秩序',
        memorySummary: npc.name + '与玩家谈及主公招揽，重点在旧部、名分与归附条件。',
        choices: [
          { id: 'promiseAutonomy', label: '承诺保留旧部与名分' },
          { id: 'demandSubmission', label: '要求其承认你的盟主地位' },
          { id: 'offerProtection', label: '许诺保护其宗族与百姓' }
        ]
      };
    }

    async function startLordSolicitation(characterId) {
      const npc = gameState.characterRoster?.[characterId];
      if (!npc) return toast('人物不存在');
      if (!isFactionLordCharacter(npc)) return toast('此人不是势力主公');
      const eligibility = getLordSolicitationEligibility(npc);
      if (!eligibility.eligible) return toast(eligibility.reason || '条件不足，无法招揽');
      if (!spendPoint('dip')) return;
      const context = buildLordSolicitationContext(npc, eligibility);
      gameState.activeModal = { type: 'lordSolicitation', characterId: npc.id, loading: true, dialogue: generateLordSolicitationFallback(context), eligibility };
      renderModal();
      let dialogue;
      try {
        dialogue = await generateNpcDialogue(context);
      } catch (err) {
        console.error('主公招揽 AI 生成失败', err);
        dialogue = generateLordSolicitationFallback(context);
      }
      gameState.activeModal = { type: 'lordSolicitation', characterId: npc.id, loading: false, dialogue: normalizeDialogueResult(dialogue, generateLordSolicitationFallback(context)), eligibility };
      renderModal();
    }

    function handleLordAlliance(characterId) {
      const npc = gameState.characterRoster?.[characterId];
      if (!npc || !isFactionLordCharacter(npc)) return toast('只有势力主公可以缔结正式盟约');
      const factionId = npc.lordOfFaction || FACTION_LORD_META[npc.id]?.faction || npc.faction;
      if (isPlayerAlliedWithFaction(factionId)) {
        cancelAllianceWithFaction(factionId, 'player');
        pushTurnEvent({ level: 'important', tone: 'warn', text: '你与' + factionName(factionId) + '正式解约，双方不再互助。' });
        saveToStorage(false);
        render();
        return toast('盟约已解除');
      }
      const eligibility = getAllianceEligibility(npc);
      if (!eligibility.eligible) return toast(eligibility.reason || '结盟条件不足');
      if (!spendPoint('dip')) return;
      formAllianceWithFaction(factionId, { lord: npc, initiator: 'player', relationBonus: 8 });
      pushTurnEvent({ level: 'important', tone: 'good', text: '你与' + factionName(factionId) + '正式结盟。盟约期间双方可能互助或求援。' });
      saveToStorage(false);
      render();
      toast('盟约已缔结');
    }

    function revealFactionCharactersAfterSubmission(factionId, reports) {
      let contactable = 0;
      Object.values(gameState.characterRoster || {}).forEach(character => {
        if (!character || character.faction !== factionId || isInternalPlayerCharacterId(character.id)) return;
        if (character.status === 'hidden') {
          character.status = 'rumored';
          character.discoveredBy = '主公归附';
          contactable++;
        } else if (character.status === 'rumored' || character.status === 'discovered') {
          character.status = 'contactable';
          character.discoveredBy = '主公归附';
          contactable++;
        }
      });
      if (contactable) {
        reports.push({ tone: 'good', level: 'minor', text: factionName(factionId) + '旧部中有 ' + contactable + ' 人进入可接触或传闻。' });
      }
      return contactable;
    }

    function clearFactionCampaignsAgainstPlayer(factionId, reports) {
      let cleared = 0;
      (gameState.campaigns || []).forEach(campaign => {
        if (!isActiveCampaign(campaign)) return;
        const attacksPlayer = campaign.faction === factionId && cityController(campaign.target) === 'player';
        const playerAttacksFaction = campaign.faction === 'player' && cityController(campaign.target) === factionId;
        if (!attacksPlayer && !playerAttacksFaction) return;
        campaign.status = 'complete';
        campaign.phase = '归附停战';
        campaign.slotOccupied = false;
        cleared++;
      });
      if (cleared) {
        reports.push({ tone: 'good', level: 'minor', text: factionName(factionId) + '归附后，双方 ' + cleared + ' 路战役停战。' });
      }
      return cleared;
    }

    function applyLordSubmission(npc, choiceId, eligibility, reports) {
      const factionId = npc.lordOfFaction || FACTION_LORD_META[npc.id]?.faction || npc.faction;
      const pressure = eligibility.pressure || getFactionPressureProfile(factionId);
      const cities = getFactionControlledCityIds(factionId);
      const oldFactionName = factionName(factionId);
      gameState.submissionState ||= {};
      gameState.submissionState[factionId] = {
        factionId,
        lordId: npc.id,
        submittedTurn: gameState.turn,
        protectedUntil: gameState.turn + 8,
        grievance: clamp(Number(pressure.grievance || 0) + (choiceId === 'demandSubmission' ? 18 : 0), 0, 100),
        pressureAtSubmission: Math.round(pressure.pressure || 0),
        playerAttacks: Number(pressure.playerAttacks || 0),
        warningLevel: 0,
        status: 'submitted'
      };

      clearFactionCampaignsAgainstPlayer(factionId, reports);
      cities.forEach(cityId => {
        const city = gameState.cities[cityId];
        if (!city) return;
        captureRegion(cityId, 'player', reports, { select: false, skipProtectionDecay: true });
        city.publicSupport = clamp(Number(city.publicSupport || 0) - clamp(4 + pressure.grievance / 14, 3, 12), 0, 100);
        city.order = clamp(Number(city.order || 0) - clamp(5 + pressure.grievance / 12, 4, 14), 0, 100);
        city.submissionUnrest = {
          factionId,
          lordId: npc.id,
          untilTurn: gameState.turn + 14,
          grievance: gameState.submissionState[factionId].grievance
        };
      });

      npc.status = 'recruited';
      npc.faction = 'player';
      npc.recruitedBy = gameState.player.name;
      npc.solicitationState = 'aligned';
      npc.lordSolicitation ||= {};
      npc.lordSolicitation.status = 'aligned';
      npc.lordSolicitation.turn = gameState.turn;
      npc.lordSolicitation.choiceId = choiceId;
      npc.lordSolicitation.originalFaction = factionId;
      npc.lordSolicitation.grievance = gameState.submissionState[factionId].grievance;
      npc.npcAgency ||= {};
      npc.npcAgency.relationshipStance = choiceId === 'demandSubmission' ? 'dependentLord' : 'subordinateAlly';

      gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + Math.max(4, cities.length * 3), 0, 100);
      gameState.player.ambition = clamp(Number(gameState.player.ambition || 0) + Math.max(3, cities.length * 2), 0, 100);
      gameState.player.threat = clamp(Number(gameState.player.threat || 0) + Math.max(2, cities.length), 0, 100);

      revealFactionCharactersAfterSubmission(factionId, reports);
      reports.push({
        tone: 'good',
        level: 'critical',
        text: npc.name + '率' + oldFactionName + '归附，你获得 ' + cities.length + ' 座城池实际控制权；旧部不稳将在 ' + (gameState.submissionState[factionId].protectedUntil - gameState.turn) + ' 回合后开始发酵。'
      });
      return { factionId, cities };
    }

    function rollLordSolicitationOutcome(npc, choiceId, eligibility) {
      const pressure = eligibility.pressure || getFactionPressureProfile(npc.lordOfFaction || npc.faction);
      let chance = Number(eligibility.successChance || 0.2);
      if (choiceId === 'promiseAutonomy') chance += 0.08;
      if (choiceId === 'offerProtection') chance += 0.05;
      if (choiceId === 'demandSubmission') chance -= 0.08;
      chance += clamp(Number(npc.trustPlayer || 0) - 60, -25, 25) / 400;
      chance += clamp(Number(pressure.pressure || 0) - 45, -20, 35) / 360;
      chance -= clamp(Number(pressure.grievance || 0), 0, 100) / 420;
      chance -= clamp(Number(npc.suspicionOfPlayer || 0) - 45, 0, 50) / 380;
      chance = clamp(chance, 0.04, eligibility.profile?.maxChance ? eligibility.profile.maxChance / 100 : 0.55);
      const roll = Math.random();
      if (roll < chance) return { result: 'success', chance, roll };
      const disputeChance = clamp(0.18 + Number(npc.personality?.proud || 45) / 500 + Number(pressure.grievance || 0) / 360, 0.18, 0.55);
      if (roll < chance + disputeChance) return { result: 'dispute', chance, roll };
      const hostilityChance = clamp(0.08 + Number(npc.suspicionOfPlayer || 0) / 700 + (choiceId === 'demandSubmission' ? 0.08 : 0), 0.06, 0.28);
      if (roll > 1 - hostilityChance) return { result: 'hostile', chance, roll };
      return { result: 'delay', chance, roll };
    }

    function resolveLordSolicitationChoice(characterId, choiceId) {
      const npc = gameState.characterRoster?.[characterId];
      if (!npc || !isFactionLordCharacter(npc)) return toast('主公招揽目标不存在');
      const eligibility = getLordSolicitationEligibility(npc);
      const choiceLabels = {
        promiseAutonomy: '承诺保留旧部与名分',
        demandSubmission: '要求其承认你的盟主地位',
        offerProtection: '许诺保护其宗族与百姓'
      };
      if (!eligibility.eligible) {
        npc.suspicionOfPlayer = clamp(Number(npc.suspicionOfPlayer || 0) + 5, 0, 100);
        npc.npcAgency ||= {};
        npc.npcAgency.grievance = { turn: gameState.turn, source: 'lordSolicitation', summary: '玩家实力不足仍试图招揽', resolved: false };
        addCharacterMemory(npc, {
          turn: gameState.turn,
          type: 'lordSolicitation',
          summary: '玩家实力不足仍试图招揽，' + npc.name + '心生戒备。',
          text: '玩家实力不足仍试图招揽，' + npc.name + '心生戒备。'
        });
        gameState.activeModal = null;
        saveToStorage(false);
        render();
        return toast('条件不足，招揽失败');
      }

      const reports = [];
      const outcome = rollLordSolicitationOutcome(npc, choiceId, eligibility);
      npc.npcAgency ||= {};
      let summary = '';
      if (outcome.result === 'success') {
        npc.attitudeToPlayer = clamp(Number(npc.attitudeToPlayer || 0) + 12, 0, 100);
        npc.trustPlayer = clamp(Number(npc.trustPlayer || 0) + (choiceId === 'demandSubmission' ? 3 : 8), 0, 100);
        npc.respectPlayer = clamp(Number(npc.respectPlayer || 0) + (choiceId === 'demandSubmission' ? 8 : 5), 0, 100);
        npc.fearPlayer = clamp(Number(npc.fearPlayer || 0) + 5, 0, 100);
        applyLordSubmission(npc, choiceId, eligibility, reports);
        summary = npc.name + '接受招揽，承认你的主导地位。成功率 ' + Math.round(outcome.chance * 100) + '%。';
      } else if (outcome.result === 'dispute') {
        npc.trustPlayer = clamp(Number(npc.trustPlayer || 0) - (choiceId === 'demandSubmission' ? 8 : 4), 0, 100);
        npc.suspicionOfPlayer = clamp(Number(npc.suspicionOfPlayer || 0) + 10, 0, 100);
        npc.respectPlayer = clamp(Number(npc.respectPlayer || 0) + (choiceId === 'demandSubmission' ? 2 : 0), 0, 100);
        npc.npcAgency.grievance = { turn: gameState.turn, source: 'lordSolicitation', summary: '招揽席上发生争执', resolved: false };
        summary = npc.name + '没有归附，席间与玩家发生争执。成功率 ' + Math.round(outcome.chance * 100) + '%。';
        reports.push({ tone: 'warn', level: 'important', text: summary });
      } else if (outcome.result === 'hostile') {
        npc.trustPlayer = clamp(Number(npc.trustPlayer || 0) - 12, 0, 100);
        npc.suspicionOfPlayer = clamp(Number(npc.suspicionOfPlayer || 0) + 18, 0, 100);
        npc.fearPlayer = clamp(Number(npc.fearPlayer || 0) + 4, 0, 100);
        npc.npcAgency.relationshipStance = 'hostile';
        npc.npcAgency.grievance = { turn: gameState.turn, source: 'lordSolicitation', summary: '公开拒绝招揽，转为敌意', resolved: false };
        summary = npc.name + '公开拒绝招揽，旧部敌意上升。成功率 ' + Math.round(outcome.chance * 100) + '%。';
        reports.push({ tone: 'bad', level: 'important', text: summary });
      } else {
        npc.trustPlayer = clamp(Number(npc.trustPlayer || 0) + (choiceId === 'promiseAutonomy' ? 2 : 0), 0, 100);
        npc.suspicionOfPlayer = clamp(Number(npc.suspicionOfPlayer || 0) + 4, 0, 100);
        summary = npc.name + '暂缓归附，仍在观望局势。成功率 ' + Math.round(outcome.chance * 100) + '%。';
        reports.push({ tone: 'warn', level: 'minor', text: summary });
      }
      addCharacterMemory(npc, {
        turn: gameState.turn,
        type: 'lordSolicitation',
        summary,
        text: summary,
        choice: choiceLabels[choiceId] || choiceId
      });
      reports.forEach(report => {
        addNews(report.tone, report.text);
        pushTurnEvent({ level: report.level || 'important', tone: report.tone, text: report.text });
      });
      gameState.activeModal = null;
      saveToStorage(false);
      render();
      toast(outcome.result === 'success' ? '主公招揽达成' : '主公未归附');
    }

    function processSubmissionInstability(reports) {
      gameState.submissionState ||= {};
      Object.entries(gameState.submissionState).forEach(([factionId, state]) => {
        if (!state || state.status !== 'submitted') return;
        const lord = gameState.characterRoster?.[state.lordId];
        const submittedCities = Object.values(gameState.cities || {}).filter(city =>
          city &&
          !isRemovedCityId(city.id) &&
          cityController(city.id) === 'player' &&
          city.submissionUnrest?.factionId === factionId
        );
        if (!submittedCities.length) {
          state.status = 'absorbed';
          return;
        }
        if (gameState.turn <= Number(state.protectedUntil || 0)) return;

        const avgPublic = submittedCities.reduce((sum, city) => sum + Number(city.publicSupport || 0), 0) / submittedCities.length;
        const avgOrder = submittedCities.reduce((sum, city) => sum + Number(city.order || 0), 0) / submittedCities.length;
        const avgFood = submittedCities.reduce((sum, city) => sum + Number(city.food || 0), 0) / submittedCities.length;
        const avgTroops = submittedCities.reduce((sum, city) => sum + realTroops(city.garrison), 0) / submittedCities.length;
        const trust = Number(lord?.trustPlayer || 45);
        const grievance = Number(state.grievance || 0);
        const risk = clamp(
          grievance * 0.65 +
          (55 - avgPublic) * 0.75 +
          (55 - avgOrder) * 0.75 +
          (avgFood < 1200 ? 10 : 0) +
          (avgTroops < 650 ? 10 : 0) +
          (50 - trust) * 0.65 +
          Number(state.playerAttacks || 0) * 6,
          0,
          100
        );
        state.lastRisk = Math.round(risk);

        if (risk >= 55 && state.warningLevel < 1) {
          state.warningLevel = 1;
          reports.push({ tone: 'warn', level: 'important', text: factionName(factionId) + '旧部不稳，归附城池暗中怀念故主。若民心、治安或主公信任继续下滑，可能反叛。' });
          return;
        }
        if (risk < 72) return;
        const chance = clamp((risk - 62) / 100, 0.08, 0.42);
        if (Math.random() >= chance) return;

        const rebelCount = Math.max(1, Math.ceil(submittedCities.length * clamp(risk / 140, 0.35, 0.75)));
        submittedCities
          .sort((a, b) => (Number(a.publicSupport || 0) + Number(a.order || 0)) - (Number(b.publicSupport || 0) + Number(b.order || 0)))
          .slice(0, rebelCount)
          .forEach(city => {
            captureRegion(city.id, factionId, reports, { select: false, skipProtectionDecay: true });
            city.submissionUnrest = null;
            city.morale = clamp(Number(city.morale || 0) + 8, 0, 100);
          });
        if (lord) {
          lord.status = 'contactable';
          lord.faction = factionId;
          lord.solicitationState = 'rebelled';
          lord.trustPlayer = clamp(Number(lord.trustPlayer || 0) - 18, 0, 100);
          lord.suspicionOfPlayer = clamp(Number(lord.suspicionOfPlayer || 0) + 20, 0, 100);
          lord.npcAgency ||= {};
          lord.npcAgency.relationshipStance = 'hostile';
          addCharacterMemory(lord, {
            turn: gameState.turn,
            type: 'submissionRebellion',
            summary: factionName(factionId) + '旧部反叛，' + lord.name + '重新自立。',
            text: factionName(factionId) + '旧部反叛，' + lord.name + '重新自立。'
          });
        }
        state.status = 'rebelled';
        reports.push({ tone: 'bad', level: 'critical', text: factionName(factionId) + '旧部反叛，' + rebelCount + ' 座归附城池倒向故主。' });
      });
    }

    function processAllianceDiplomacy(reports) {
      Object.keys(FACTIONS).filter(factionId => factionId !== 'player' && factionId !== 'local').forEach(factionId => {
        const record = ensureDiplomacyRecord(factionId);
        if (!record || record.pact !== '盟友' || record.alliance?.active === false) return;
        const lord = getLordCharacterByFaction(factionId);
        const relation = Number(record.relation || 0);
        const playerUnderAttack = (gameState.campaigns || []).filter(campaign =>
          isActiveCampaign(campaign) &&
          campaign.faction !== 'player' &&
          cityController(campaign.target) === 'player'
        );
        const allyUnderAttack = (gameState.campaigns || []).filter(campaign =>
          isActiveCampaign(campaign) &&
          campaign.faction !== factionId &&
          cityController(campaign.target) === factionId
        );

        if (relation < 24 && gameState.turn - Number(record.alliance.cancelledTurn || -99) > 2 && Math.random() < 0.22) {
          cancelAllianceWithFaction(factionId, 'npc', reports);
          return;
        }

        if (playerUnderAttack.length && gameState.turn - Number(record.alliance.lastAidTurn || -99) >= 5 && Math.random() < clamp(0.18 + relation / 260, 0.18, 0.5)) {
          const home = controlledCities().sort((a, b) => realTroops(b.garrison) - realTroops(a.garrison))[0];
          if (home) {
            const food = Math.max(180, Math.round((gameState.cities[gameState.player.startingCity || home.id]?.food || 0) * 0.02));
            home.food = Math.max(0, Number(home.food || 0) + food);
            home.garrison.infantry = Math.max(0, Number(home.garrison.infantry || 0) + 120);
            record.alliance.lastAidTurn = gameState.turn;
            reports.push({ tone: 'good', level: 'important', text: factionName(factionId) + '履行盟约，向' + home.name + '送来粮草 ' + fmt(food) + ' 与援兵 120。' });
          }
        }

        if (allyUnderAttack.length && gameState.turn - Number(record.alliance.lastRequestTurn || -99) >= 5 && Math.random() < clamp(0.15 + (100 - relation) / 280, 0.12, 0.42)) {
          record.alliance.lastRequestTurn = gameState.turn;
          if (lord) {
            createLetter({
              senderId: lord.id,
              title: factionName(factionId) + '求援',
              body: factionName(factionId) + '遭受攻打，' + lord.name + '请求你履行盟约，出兵、送粮或至少牵制敌军。',
              kind: 'allianceRequest',
              choices: [{ id: 'ack', label: '知晓' }]
            });
          }
          reports.push({ tone: 'warn', level: 'important', text: factionName(factionId) + '依据盟约向你求援。' });
        }
      });
    }

    function markLetterResolved(letter, choiceId) {
      if (!letter || letter.resolved) return;
      letter.resolved = true;
      letter.choiceId = choiceId;
      letter.resolvedTurn = gameState.turn;
    }

    function createLetter({ senderId, title, body, choices, critical = false, kind = '', meta = null }) {
      // 禁止内部班底作为 npcInitiative 主动来信
      if (kind === 'npcInitiative' && isInternalPlayerCharacterId(senderId)) {
        return null;
      }
      const sender = gameState.characterRoster[senderId] || characterBlueprint(senderId, senderId);
      const letter = {
        id: uid(),
        senderId,
        senderName: sender.name,
        senderFaction: sender.faction,
        date: formatDate(),
        title,
        body,
        choices: choices || [{ id: 'ack', label: '谨遵来意' }],
        kind,
        meta: meta || {},
        resolved: false,
        read: false,
        critical
      };
      gameState.letters.unshift(letter);
      pushTurnEvent({ level: critical ? 'critical' : 'important', tone: 'warn', type: 'letter', letterId: letter.id, text: '收到' + sender.name + '来信：《' + title + '》' });
      return letter;
    }

    function openLetterModal(letterId) {
      const letter = gameState.letters.find(item => item.id === letterId);
      if (!letter) return;
      letter.read = true;
      gameState.activeModal = { type: 'letter', letterId };
      renderModal();
    }

    function hideLetterCinematicOverlay() {
      const cinematicRoot = document.getElementById('letterCinematicRoot');
      if (!cinematicRoot) return;
      cinematicRoot.classList.remove('show');
      cinematicRoot.innerHTML = '';
    }

    function showLetterCinematicOverlay(letter) {
      const cinematicRoot = document.getElementById('letterCinematicRoot');
      const cinematic = letter?.meta?.cinematic;
      if (!cinematicRoot || !letter || !cinematic?.src) return;
      cinematicRoot.classList.add('show');
      cinematicRoot.innerHTML = `<div class="letter-cinematic-frame is-loading" data-letter-cinematic-frame="${letter.id}" aria-label="${escapeHtml(cinematic.title || letter.title)}">
        <button class="letter-cinematic-skip" data-finish-letter-cinematic="${letter.id}">跳过动画</button>
        <div class="media-loading" data-letter-cinematic-loading="${letter.id}">
          <div class="media-loading-spinner"></div>
          <span class="media-loading-label">画面加载中…</span>
        </div>
        <video class="letter-cinematic-video" data-letter-cinematic-video="${letter.id}" src="${escapeHtml(cinematic.src)}" playsinline preload="auto"></video>
      </div>`;
      playLetterCinematicVideo(letter.id);
    }

    function playLetterCinematicVideo(letterId) {
      pauseBgm(); // 进入信件动画时暂停背景音乐
      const video = Array.from(document.querySelectorAll('[data-letter-cinematic-video]')).find(item => item.getAttribute('data-letter-cinematic-video') === letterId);
      if (!video) return;
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      const frame = video.closest('.letter-cinematic-frame');
      const startPlayback = () => {
        if (frame) frame.classList.remove('is-loading');
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') playback.catch(() => {});
      };
      // 等到可以流畅播完再开始；超时兜底防止网络太慢一直卡 loading
      whenMediaReady(video, startPlayback);
    }

    // 等待媒体缓冲到可流畅播放（canplaythrough），带超时兜底
    function whenMediaReady(media, onReady, timeoutMs = 8000) {
      if (!media) return onReady();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        media.removeEventListener('canplaythrough', finish);
        media.removeEventListener('error', finish);
        onReady();
      };
      // 已经缓冲到可流畅播放
      if (media.readyState >= 4) return finish();
      media.addEventListener('canplaythrough', finish, { once: true });
      media.addEventListener('error', finish, { once: true });
      const timer = setTimeout(finish, timeoutMs);
      try { media.load(); } catch (_) {}
    }

    function finishLetterCinematic(letterId) {
      const letter = gameState.letters.find(item => item.id === letterId);
      if (!letter) return;
      letter.meta ||= {};
      letter.meta.cinematicWatched = true;
      saveToStorage(false);
      hideLetterCinematicOverlay();
      resumeBgm(); // 信件动画结束后恢复背景音乐
      if (gameState.activeModal?.type === 'letter' && gameState.activeModal.letterId === letterId) {
        renderModal();
      }
    }

    function resolveNpcLetterChoice(letter, choiceId, reports = []) {
      const senderId = letter.fromCharacterId || letter.senderId || letter.fromId || letter.sender || letter.characterId || (letter.meta && letter.meta.characterId);
      const npc = gameState.characterRoster ? gameState.characterRoster[senderId] : null;
      if (!npc) return false;

      const p = npc.personality || {};
      let deltaTrust = 0;
      let deltaSuspicion = 0;
      let deltaFear = 0;
      let deltaRespect = 0;

      // Base effects by choice category
      const choiceLower = (choiceId || '').toLowerCase();
      if (/^(accept|support|agree|reassure|promise|promiseoffice)$/.test(choiceLower)) {
        deltaTrust = 4 + Math.floor(Math.random() * 5);
        deltaRespect = 2 + Math.floor(Math.random() * 4);
        deltaSuspicion = -(3 + Math.floor(Math.random() * 4));
      } else if (/^(reject|refuse|decline)$/.test(choiceLower)) {
        deltaTrust = -(4 + Math.floor(Math.random() * 5));
        deltaSuspicion = 3 + Math.floor(Math.random() * 4);
        deltaRespect = (p.proud >= 55) ? -2 : 0;
      } else if (/^(ignore)$/.test(choiceLower)) {
        deltaTrust = -2;
        deltaSuspicion = 4;
      } else if (/^(threaten|pressure)$/.test(choiceLower)) {
        deltaFear = 6 + Math.floor(Math.random() * 7);
        deltaSuspicion = 5;
        deltaTrust = -5;
      } else if (/^(reward|gift|grant|office|grantoffice)$/.test(choiceLower)) {
        deltaTrust = 5;
        deltaSuspicion = -2;
        if (p.greedy >= 55) deltaTrust += 3;
      } else if (/^(invitetalk|invite|talk|meet)$/.test(choiceLower)) {
        deltaTrust = 2;
        npc.npcAgency.pendingConversation = true;
      } else if (/^(delay|later|postpone)$/.test(choiceLower)) {
        deltaSuspicion = 2;
        if (p.cautious >= 55) deltaSuspicion += 2;
      } else {
        deltaTrust = 1;
        deltaSuspicion = 1;
      }

      // Personality modifiers
      if (/^(threaten|pressure)$/.test(choiceLower) && p.proud >= 55) {
        deltaTrust -= 3;
      }
      if (/^(reward|gift|grant)$/.test(choiceLower) && p.greedy >= 55) {
        deltaTrust += 2;
      }
      if (/^(delay|later|postpone|ignore)$/.test(choiceLower) && p.cautious >= 55) {
        deltaSuspicion += 2;
      }
      if (/^(support|reassure)$/.test(choiceLower) && p.loyal >= 55) {
        deltaTrust += 2;
        deltaRespect += 1;
      }
      if (/^(promise|promiseoffice|grant|office|grantoffice)$/.test(choiceLower) && (npc.stats?.ambition || 0) >= 55) {
        deltaTrust += 2;
      }
      if (/^(accept|support|agree|reassure)$/.test(choiceLower) && p.idealistic >= 55) {
        deltaRespect += 2;
      }
      if (/^(threaten|pressure)$/.test(choiceLower) && p.ruthless >= 55) {
        deltaRespect = Math.max(deltaRespect, 0);
      }

      // Apply and clamp
      npc.trustPlayer = clamp((npc.trustPlayer || 0) + deltaTrust, 0, 100);
      npc.suspicionOfPlayer = clamp((npc.suspicionOfPlayer || 0) + deltaSuspicion, 0, 100);
      npc.fearPlayer = clamp((npc.fearPlayer || 0) + deltaFear, 0, 100);
      npc.respectPlayer = clamp((npc.respectPlayer || 0) + deltaRespect, 0, 100);

      // Determine valence
      const netEffect = deltaTrust - deltaSuspicion + deltaRespect - deltaFear;
      const valence = netEffect > 2 ? 'positive' : netEffect < -2 ? 'negative' : 'neutral';

      // Importance
      let importance = 1;
      if (Math.abs(netEffect) >= 10) importance = 4;
      else if (Math.abs(netEffect) >= 6) importance = 3;
      else if (Math.abs(netEffect) >= 3) importance = 2;

      // Write memory
      addCharacterMemory(npc, {
        turn: gameState.turn,
        type: 'letterChoice',
        summary: '玩家对来信《' + (letter.title || '') + '》选择了' + choiceId + '。',
        emotionalShift: {
          trust: deltaTrust,
          suspicion: deltaSuspicion,
          fear: deltaFear,
          respect: deltaRespect
        },
        valence,
        importance,
        tags: ['letterChoice', choiceId],
        promise: /^(promise|promiseoffice)$/.test(choiceLower),
        grievance: /^(threaten|refuse|reject|decline|ignore)$/.test(choiceLower),
        favor: /^(reward|gift|grant|office|grantoffice)$/.test(choiceLower),
        effects: {
          trustPlayer: deltaTrust,
          suspicionOfPlayer: deltaSuspicion,
          fearPlayer: deltaFear,
          respectPlayer: deltaRespect
        },
        resolved: false
      });

      // Update npcAgency
      npc.npcAgency.lastPlayerReply = {
        turn: gameState.turn,
        letterId: letter.id,
        choiceId,
        delta: { trust: deltaTrust, suspicion: deltaSuspicion, fear: deltaFear, respect: deltaRespect }
      };

      if (/^(promise|promiseoffice)$/.test(choiceLower)) {
        npc.npcAgency.unresolvedPromise = {
          turn: gameState.turn,
          source: 'letterChoice',
          summary: /^promiseoffice$/.test(choiceLower) ? '玩家在来信中允诺官职' : '玩家在来信中有所承诺',
          resolved: false
        };
      }

      if (/^(threaten|refuse|reject|decline|ignore)$/.test(choiceLower)) {
        npc.npcAgency.grievance = {
          turn: gameState.turn,
          source: 'letterChoice',
          summary: '玩家的回应令此人不满',
          resolved: false
        };
      }

      if (/^(reward|gift|grant|office|grantoffice)$/.test(choiceLower)) {
        npc.npcAgency.favor = {
          turn: gameState.turn,
          source: 'letterChoice',
          summary: /^(office|grantoffice)$/.test(choiceLower) ? '玩家授予官职，深受感激' : '玩家给予赏赐或善意',
          resolved: false
        };
        if (/^(office|grantoffice)$/.test(choiceLower)) {
          npc.npcAgency.currentDesire = '受封官职，愿效死力';
        }
      }

      // Update stance and plan
      updateNpcAttitudeToPlayer(npc);
      updateNpcRelationshipStance(npc);
      refreshNpcPlan(npc);

      reports.push(npc.name + ' 对你的回应有所变化：信任' + (deltaTrust >= 0 ? '+' : '') + deltaTrust + '，怀疑' + (deltaSuspicion >= 0 ? '+' : '') + deltaSuspicion + '。');
      return true;
    }

    async function resolveLetterChoice(letterId, choiceId) {
      const letter = gameState.letters.find(item => item.id === letterId);
      if (!letter || letter.resolved) return;

      const reports = [];

      if (letter.kind === 'npcInitiative') {
        const result = await resolveNpcInitiativeLetter(letter, choiceId);
        if (result === 'conversation') return;
      } else if (letter.kind === 'liuBiaoBreak') {
        resolveLiuBiaoBreakChoice(letter, choiceId, reports);
      } else if (letter.kind === 'plotEvent') {
        resolvePlotEventChoice(letter, choiceId, reports);
      } else if (letter.kind === 'redemption') {
        resolveRedemptionLetter(letter, choiceId, reports);
      } else {
        resolveNpcLetterChoice(letter, choiceId, reports);
      }

      const senderId = letter.fromCharacterId || letter.senderId || letter.fromId || letter.sender || letter.characterId || (letter.meta && letter.meta.characterId);
      if (senderId === 'liuBiao' && letter.kind !== 'plotEvent') {
        if (choiceId === 'obey') gameState.player.protection = clamp(gameState.player.protection + 3, 0, 100);
        if (choiceId === 'support') gameState.cities.guiyang.food += 420;
        if (choiceId === 'conceal') applyProtectionDecay(6, '你向刘表隐瞒桂阳实情');
        if (choiceId === 'authority') gameState.player.ambition = clamp(gameState.player.ambition + 4, 0, 100);
      }

      letter.resolved = true;
      letter.choiceId = choiceId;
      letter.resolvedTurn = gameState.turn;

      reports.forEach(text => {
        if (typeof text === 'string') addNews('good', text);
        else pushTurnEvent(text);
      });

      addNews('good', '你已回复' + letter.senderName + '来信：《' + letter.title + '》。');
      gameState.activeModal = null;
      openNextCriticalModal();
      saveToStorage(false);
      render();
    }

    async function resolveNpcInitiativeLetter(letter, choiceId) {
      const npc = gameState.characterRoster[letter.senderId];
      if (!npc) return false;
      const effectsByChoice = {
        meet: { trustPlayer: 2, respectPlayer: 1, suspicionOfPlayer: -1, fearPlayer: 0, loyalty: 0, ambition: 0 },
        heed: { trustPlayer: 3, respectPlayer: 2, suspicionOfPlayer: -2, fearPlayer: 0, loyalty: 0, ambition: 0 },
        delay: { trustPlayer: -1, respectPlayer: 0, suspicionOfPlayer: 2, fearPlayer: 0, loyalty: 0, ambition: 0 },
        reject: { trustPlayer: -3, respectPlayer: -1, suspicionOfPlayer: 3, fearPlayer: 0, loyalty: 0, ambition: 0 }
      };
      const effects = effectsByChoice[choiceId] || effectsByChoice.heed;
      npc.trustPlayer = clamp(npc.trustPlayer + effects.trustPlayer, 0, 100);
      npc.respectPlayer = clamp(npc.respectPlayer + effects.respectPlayer, 0, 100);
      npc.suspicionOfPlayer = clamp(npc.suspicionOfPlayer + effects.suspicionOfPlayer, 0, 100);
      npc.fearPlayer = clamp(npc.fearPlayer + (effects.fearPlayer || 0), 0, 100);
      updateNpcAttitudeToPlayer(npc);
      updateNpcRelationshipStance(npc);
      refreshNpcPlan(npc);
      // Update npcAgency
      npc.npcAgency.lastPlayerReply = {
        turn: gameState.turn,
        letterId: letter.id,
        choiceId,
        delta: { trust: effects.trustPlayer, suspicion: effects.suspicionOfPlayer, fear: effects.fearPlayer || 0, respect: effects.respectPlayer }
      };
      const desireByChoice = {
        meet: '希望进一步会谈',
        heed: '建议被采纳，愿意继续献策',
        delay: '等待回应，但疑虑增加',
        reject: '来意被拒，开始保持距离'
      };
      npc.npcAgency.currentDesire = desireByChoice[choiceId] || '等待后续发展';
      npc.npcAgency.shortTermPlan = npc.currentPlan;
      const reaction = choiceId === 'meet' ? '主动求见被接纳' : choiceId === 'delay' ? '请求被搁置' : choiceId === 'reject' ? '来意被拒' : '建议被采纳';
      addCharacterMemory(npc, {
        type: 'npcInitiative',
        summary: npc.name + '主动提出"' + (letter.meta?.reason || '会谈') + '"，你的回应是：' + reaction + '。',
        playerTone: choiceId,
        npcReaction: reaction,
        planAfter: npc.currentPlan,
        effects
      });
      if (choiceId === 'meet') {
        markLetterResolved(letter, choiceId);
        addNews('good', '你接纳了' + npc.name + '的求见。');
        gameState.activeModal = null;
        saveToStorage(false);
        await startNpcConversation(npc.id, letter.meta?.suggestedConversation || 'talk');
        return 'conversation';
      }
      return false;
    }

    function triggerSpecialEvent(eventId) {
      const blueprint = SPECIAL_EVENT_BLUEPRINTS[eventId];
      if (!blueprint) return;
      const state = gameState.specialEventState;
      if (blueprint.onceOnly && state.triggered[eventId]) return;
      if ((state.cooldowns[eventId] || 0) > gameState.turn) return;
      state.triggered[eventId] = true;
      state.cooldowns[eventId] = gameState.turn + (blueprint.cooldown || 999);
      const event = Object.assign({}, blueprint, { id: eventId + '_' + uid(), blueprintId: eventId });
      if (blueprint.level === 'critical') {
        state.queue.push(event);
        if (eventId !== 'liubiao_letter') {
          pushTurnEvent({ level: 'critical', tone: 'warn', type: 'special', specialEventId: event.id, text: blueprint.title + '：' + blueprint.description });
        }
      } else {
        pushTurnEvent({ level: blueprint.level, tone: 'warn', type: 'special', specialEventId: event.id, text: blueprint.title + '：' + blueprint.description });
      }
      return event;
    }

    function evaluateSpecialEvents() {
      if (gameState.turn >= 2) triggerSpecialEvent('night_guiyang');
      if (gameState.turn >= 2 && !gameState.specialEventState.triggered.liubiao_letter) {
        triggerSpecialEvent('liubiao_letter');
        gameState.specialEventState.queue = gameState.specialEventState.queue.filter(event => event.blueprintId !== 'liubiao_letter');
        createLetter({
          senderId: 'liuBiao',
          title: '桂阳安抚之事',
          body: '桂阳初定，士族未附，豪强观望。卿当宽猛并济，勿急于征伐。若能稳住荆南，吾必另有重托。',
          choices: [
            { id: 'obey', label: '谨遵刘牧之命' },
            { id: 'support', label: '请求增援' },
            { id: 'conceal', label: '隐瞒桂阳实情' },
            { id: 'authority', label: '索要更大权限' }
          ],
          critical: true
        });
      }
      if (gameState.turn >= 3 && gameState.turn % 4 === 0) triggerSpecialEvent('scholar_recommendation');
      if (gameState.turn >= 4 && gameState.turn % 4 === 0) triggerSpecialEvent('advisor_plan');
      if (gameState.turn >= 5 && gameState.turn % 5 === 0) triggerSpecialEvent('general_request');
      if (gameState.turn >= 6 && gameState.player.prestige >= 16) triggerSpecialEvent('heroes_wine');
    }

    function getNpcInitiativeScore(npc) {
      if (!npc || isInternalPlayerCharacterId(npc.id) || ['hidden', 'rumored', 'dead', 'captured'].includes(npc.status)) return 0;
      const state = gameState.npcInitiativeState;
      const lastTurn = state.lastTurnByNpc[npc.id] ?? npc.initiative?.lastTurn ?? -99;
      const cooldown = npc.initiative?.cooldown ?? 4;
      if (gameState.turn - lastTurn < cooldown) return 0;
      const ctx = getNpcStrategicContext(npc);
      const memory = getNpcMemoryProfile(npc);
      let score = npc.initiative?.urgency || 0;
      score += Math.max(0, npc.trustPlayer - 55) * 0.22;
      score += Math.max(0, npc.suspicionOfPlayer - 52) * 0.24;
      score += Math.max(0, npc.fearPlayer - 40) * 0.18;
      score += Math.max(0, npc.respectPlayer - 58) * 0.16;
      score += memory.wounds > memory.warmth ? 5 : 0;
      score += memory.warmth > memory.wounds + 5 ? 4 : 0;
      if (npc.id === 'liuBiao' && (ctx.protection < 62 || ctx.ambition > 45)) score += 16;
      if (npc.id === 'guiyangClans' && (ctx.cityOrder < 55 || ctx.citySupport < 52)) score += 12;
      if (npc.id === 'kuaiYue' && ctx.turn >= 4) score += 8;
      if (npc.id === 'wenPin' && ctx.activeCampaigns > 0) score += 10;
      if (npc.id === 'localOfficials' && ctx.cityOrder < 48) score += 9;
      if (state.recent?.some(item => item.characterId === npc.id && gameState.turn - item.turn <= 2)) score -= 8;
      return score;
    }

    function getNpcInitiativeReason(npc) {
      const ctx = getNpcStrategicContext(npc);
      if (npc.id === 'liuBiao' && ctx.protection < 62) return '庇护松动';
      if (npc.id === 'liuBiao' && ctx.ambition > 45) return '野心渐显';
      if (npc.id === 'guiyangClans' && ctx.cityOrder < 55) return '乡里不安';
      if (npc.id === 'wenPin' && ctx.activeCampaigns > 0) return '军令后续';
      if (npc.suspicionOfPlayer >= 62) return '疑虑加深';
      if (npc.trustPlayer >= 65) return '信任升温';
      if (npc.respectPlayer >= 65) return '愿意献策';
      return '另有打算';
    }

    function composeNpcInitiativeBody(npc, reason) {
      refreshNpcPlan(npc);
      const opening = getNpcSignatureOpening(npc, 'talk', getNpcAttitudeLabel(npc));
      const bodyLines = {
        '庇护松动': '襄阳近来对桂阳的耐心正在变薄。若你仍要借刘表之名行事，就必须给出能让人安心的凭据。',
        '野心渐显': '你的声势渐起，旁人会开始区分"能臣"和"异心"。我想听你亲口说明边界。',
        '乡里不安': '乡里议论已经起了波澜。若官府只求快刀，豪强未必明着反，却会在暗处拖住你。',
        '军令后续': '军令既出，后勤、期限和退路都要有人盯着。我请见，是怕胜算被琐事磨坏。',
        '疑虑加深': '此前几件事让我心中生疑。若不把话说开，往后合作只会越来越薄。',
        '信任升温': '近来我看见一些可取之处。若你愿意当面谈，我可以把手里的筹码摊开一部分。',
        '愿意献策': '我有一条判断，不宜写得太明。若你愿听，我愿当面说清利害。',
        '另有打算': '局势走到这里，我不想再只做旁观者。此信是求一个当面说话的机会。'
      };
      return opening + '\n\n' + (bodyLines[reason] || bodyLines['另有打算']) + '\n\n我眼下的打算是：' + npc.currentPlan;
    }

    function evaluateNpcInitiatives() {
      if (gameState.turn < 2) return;
      const candidates = Object.values(gameState.characterRoster)
        .filter(isExternalCharacter)
        .map(npc => ({ npc, score: getNpcInitiativeScore(npc) }))
        .filter(item => item.score >= 18)
        .sort((a, b) => b.score - a.score);
      const chosen = candidates[0];
      if (!chosen) return;
      const npc = chosen.npc;
      const reason = getNpcInitiativeReason(npc);
      gameState.npcInitiativeState.lastTurnByNpc[npc.id] = gameState.turn;
      npc.initiative.lastTurn = gameState.turn;
      gameState.npcInitiativeState.recent.unshift({ characterId: npc.id, turn: gameState.turn, reason });
      gameState.npcInitiativeState.recent = gameState.npcInitiativeState.recent.slice(0, 12);
      createLetter({
        senderId: npc.id,
        title: npc.name + '求见：' + reason,
        body: composeNpcInitiativeBody(npc, reason),
        choices: [
          { id: 'meet', label: '当面听他说' },
          { id: 'heed', label: '采纳其来意' },
          { id: 'delay', label: '暂且搁置' },
          { id: 'reject', label: '回绝此事' }
        ],
        kind: 'npcInitiative',
        meta: { reason, suggestedConversation: chosen.score >= 28 ? 'strategy' : 'talk' },
        critical: chosen.score >= 30
      });
    }

    function resolveSpecialEventChoice(eventId, choiceId) {
      const index = gameState.specialEventState.queue.findIndex(event => event.id === eventId);
      const event = gameState.specialEventState.queue[index];
      if (!event) return;
      const npc = gameState.characterRoster[event.participant];
      let resultText = '你的选择已经被相关人物记下，后续局势会据此变化。';
      if (event.blueprintId === 'scholar_recommendation') {
        const talent = Object.values(gameState.characterRoster).find(record => record.randomTalent && record.status === 'hidden');
        if (talent) {
          talent.status = 'rumored';
          talent.discoveredBy = '名士荐才';
          pushTurnEvent({ level: 'important', tone: 'good', text: '名士提及' + talent.name + '，人物传闻已出现。' });
          resultText = talent.name + '的传闻已经进入你的视野，继续调查可建立正式接触。';
        }
      } else if (event.blueprintId === 'night_guiyang') {
        gameState.characters.guiyangClans.suspicion = clamp(gameState.characters.guiyangClans.suspicion + (choiceId === 'press' ? 5 : -3), 0, 100);
        resultText = choiceId === 'press' ? '豪强暂时收敛了锋芒，却会更仔细地观察你。' : '你没有急着翻脸，桂阳豪强的试探暂时退潮。';
      } else if (event.blueprintId === 'heroes_wine' && npc) {
        npc.respectPlayer = clamp(npc.respectPlayer + 5, 0, 100);
        npc.suspicionOfPlayer = clamp(npc.suspicionOfPlayer + (choiceId === 'ambition' ? 8 : 3), 0, 100);
        resultText = choiceId === 'ambition' ? '对方看见了你的野心。敬意与戒心同时增长。' : '你留下了余地，对方仍会继续判断你的志向。';
      }
      if (npc) {
        addCharacterMemory(npc, { type: 'specialEvent', summary: event.title, playerTone: choiceId, npcReaction: '记下了你的选择', effects: {} });
        // Sync npcAgency
        if (npc.npcAgency) {
          npc.npcAgency.lastPlayerReply = {
            turn: gameState.turn,
            eventId,
            choiceId,
            summary: event.title
          };
          if (event.blueprintId === 'heroes_wine') {
            npc.npcAgency.currentDesire = choiceId === 'ambition' ? '试探玩家的野心，戒心加重' : '继续观察玩家的志向';
          } else {
            npc.npcAgency.currentDesire = '关注此事后续发展';
          }
          updateNpcRelationshipStance(npc);
          refreshNpcPlan(npc);
        }
      }
      gameState.specialEventState.queue.splice(index, 1);
      gameState.activeModal = { type: 'eventResult', title: event.title, text: resultText };
      saveToStorage(false);
      render();
    }

    function openTurnEventModal(eventId) {
      const event = gameState.pendingTurnSummary?.events.find(item => item.id === eventId)
        || gameState.turnEvents.find(item => item.id === eventId);
      if (!event) return;
      gameState.activeModal = { type: 'eventDetail', eventId: event.id, title: event.title || '局势详情', text: event.text };
      renderModal();
    }

    function buildRouteGraph() {
      const graph = {};
      const ensure = id => { if (!graph[id]) graph[id] = []; };
      const hasCity = id => !!gameState.cities[id] && !isRemovedCityId(id);
      Object.keys(gameState.cities).filter(hasCity).forEach(ensure);
      const pairs = ROUTES.concat(WATER_ROUTES);
      Object.values(gameState.cities)
        .filter(city => !isRemovedCityId(city.id))
        .forEach(city => {
          filterRemovedCityIds([...(city.neighbors || []), ...(city.roads || []), ...(city.waters || [])]).forEach(to => pairs.push([city.id, to]));
        });
      pairs.forEach(([from, to]) => {
        if (isRemovedCityId(from) || isRemovedCityId(to)) return;
        if (!hasCity(from) || !hasCity(to)) return;
        ensure(from);
        ensure(to);
        const a = getRegion(from)?.center || gameState.cities[from];
        const b = getRegion(to)?.center || gameState.cities[to];
        const distance = Math.max(1, Math.round(Math.hypot(a.x - b.x, a.y - b.y) / 105));
        const water = WATER_ROUTES.some(pair => pair.includes(from) && pair.includes(to));
        const edge = { from, to, distance, roadType: water ? 'water' : 'road', terrain: gameState.cities[to].terrain, riverCrossing: water, danger: cityController(to) === 'player' ? 0 : 1 };
        if (!graph[from].some(item => item.to === to)) graph[from].push(edge);
        if (!graph[to].some(item => item.to === from)) graph[to].push(Object.assign({}, edge, { from: to, to: from }));
      });
      return graph;
    }

    function findCampaignRoute(from, to, mode = 'official') {
      if (from === to) return { path: [from], edges: [], distance: 0, mode };
      const graph = buildRouteGraph();
      const costs = { [from]: 0 };
      const previous = {};
      const queue = [{ id: from, cost: 0 }];
      while (queue.length) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();
        if (current.id === to) break;
        (graph[current.id] || []).forEach(edge => {
          const controller = cityController(edge.to);
          const hostile = controller !== 'player';
          const risk = mode === 'raid' ? 0.85 : mode === 'river' && edge.riverCrossing ? 0.8 : hostile ? 1.34 : 1;
          const nextCost = current.cost + edge.distance * risk;
          if (costs[edge.to] === undefined || nextCost < costs[edge.to]) {
            costs[edge.to] = nextCost;
            previous[edge.to] = { from: current.id, edge };
            queue.push({ id: edge.to, cost: nextCost });
          }
        });
      }
      if (!previous[to]) return null;
      const path = [to];
      const edges = [];
      let cursor = to;
      while (cursor !== from) {
        const item = previous[cursor];
        edges.unshift(item.edge);
        path.unshift(item.from);
        cursor = item.from;
      }
      return { path, edges, distance: Math.round(costs[to]), mode };
    }

    function calculateTravelTurns(route, army = {}) {
      if (!route) return Infinity;
      const terrainModifier = route.edges.some(edge => /山|岭|关/.test(edge.terrain || '')) ? 1.2 : 1;
      const armySizeModifier = (army.troops || 0) >= 2200 ? 1.18 : 1;
      const supplyModifier = (army.supply || 0) < 3 ? 1.2 : 1;
      const modeModifier = route.mode === 'raid' ? 1.14 : route.mode === 'river' ? 0.94 : 1;
      return Math.max(1, Math.ceil(route.distance * terrainModifier * armySizeModifier * supplyModifier * modeModifier));
    }

    function activeCampaignSlotCount() {
      return gameState.campaigns.filter(campaign => campaign.faction === 'player' && campaign.slotOccupied && isActiveCampaign(campaign)).length;
    }

    function pendingLongCampaignCount() {
      return gameState.orders.filter(order => order.type === 'battle').length;
    }

    function isActiveCampaign(campaign) {
      return !!campaign && !['complete', 'cancelled', 'retreated', 'destroyed'].includes(campaign.status) && realTroops(campaign.army) > 0;
    }

    function finishCampaignIfArmyGone(campaign, reports, reason = '兵力归零') {
      if (!campaign || realTroops(campaign.army) > 0 || ['complete', 'cancelled', 'retreated', 'destroyed'].includes(campaign.status)) return false;
      campaign.status = 'destroyed';
      campaign.phase = '全军覆没';
      campaign.slotOccupied = false;
      campaign.supply = 0;
      campaign.siegeRemaining = 0;
      campaign.travelRemaining = 0;
      if (gameState.appointments?.campaignCommanders) delete gameState.appointments.campaignCommanders[campaign.id];
      const text = regionName(campaign.target) + '战役结束：' + reason + '，该部队已失去作战能力。';
      if (reports) reports.push({ tone: campaign.faction === 'player' ? 'bad' : 'good', text });
      playCampaignFeedbackEffect(campaign, ['兵力归零', '战役结束']);
      return true;
    }

    function pendingTroopsFrom(regionId) {
      return gameState.orders
        .filter(order => ['battle', 'transfer'].includes(order.type) && order.payload?.source === regionId)
        .reduce((sum, order) => sum + Number(order.payload.troops || 0), 0);
    }

    function spendPoints(kind, amount) {
      if ((gameState.actionPoints[kind] || 0) < amount) {
        toast(pointName(kind) + '不足，无法下达此命令');
        return false;
      }
      gameState.actionPoints[kind] -= amount;
      return true;
    }

    function extractTroops(garrison, amount) {
      const picked = troops(0, 0, 0, 0, 0);
      const total = Math.max(1, realTroops(garrison));
      TROOP_KINDS.forEach(kind => {
        const value = Math.min(garrison[kind], Math.round(amount * garrison[kind] / total));
        garrison[kind] -= value;
        picked[kind] = value;
      });
      return picked;
    }

    function addTroops(garrison, reinforcements) {
      TROOP_KINDS.forEach(kind => {
        garrison[kind] = Math.max(0, Number(garrison[kind] || 0) + Number(reinforcements[kind] || 0));
      });
    }

    function createMilitaryOrder(order, reports = []) {
      const source = gameState.cities[order.payload.source];
      const target = gameState.cities[order.payload.target];
      if (!source || !target) return null;
      const route = findCampaignRoute(source.id, target.id, order.payload.route || 'official');
      if (!route) return null;
      const isBattle = order.type === 'battle';
      if (isBattle && activeCampaignSlotCount() >= gameState.player.commandSlots) {
        reports.push({ tone: 'bad', text: '战役槽已满，' + source.name + '无法向' + target.name + '出征。' });
        return null;
      }
      if (isBattle) {
        penalizeAttackingAlliance(cityController(target.id), reports);
      }
      const amount = Math.min(order.payload.troops, Math.max(0, realTroops(source.garrison) - 300));
      if (amount < 100) return null;
      const armyTroops = extractTroops(source.garrison, amount);
      const travelTurns = calculateTravelTurns(route, { troops: amount, supply: 6 });
      const campaign = {
        id: 'campaign_' + uid(),
        orderId: order.id,
        faction: 'player',
        type: isBattle ? 'attack' : 'transfer',
        objective: order.payload.objective || (isBattle ? 'capture' : 'reinforce'),
        source: source.id,
        target: target.id,
        route,
        routeMode: order.payload.route || 'official',
        tactic: order.payload.tactic || 'balanced',
        army: armyTroops,
        commander: order.payload.commander || gameState.player.name,
        status: 'marching',
        phase: '行军',
        eta: travelTurns,
        travelRemaining: travelTurns,
        siegeRemaining: isBattle ? 2 : 0,
        supply: Math.max(4, Math.ceil(amount / 500) + travelTurns + 2),
        risk: route.edges.filter(edge => cityController(edge.to) !== 'player').length,
        slotOccupied: isBattle,
        createdTurn: gameState.turn
      };
      gameState.militaryOrders.push({ ...structuredClone(order), campaignId: campaign.id, status: 'marching', eta: travelTurns });
      gameState.campaigns.push(campaign);
      if (isBattle) {
        const defenderFaction = cityController(target.id);
        clearLiuBiaoProtectionForPlayerAttack(defenderFaction, reports);
        gameState.factionWarState ||= { lastAttackTurnByFaction: {}, recentWars: [] };
        gameState.factionWarState.recentWars.push({
          attacker: 'player',
          defender: defenderFaction,
          source: source.id,
          target: target.id,
          turn: gameState.turn,
          troops: amount,
          routeMode: campaign.routeMode
        });
        if (gameState.factionWarState.recentWars.length > 30) {
          gameState.factionWarState.recentWars.shift();
        }
      }
      playMarchEffect(campaign);
      reports.push({ tone: 'good', text: source.name + '军启程前往' + target.name + '，预计 ' + travelTurns + ' 回合抵达。' });
      if (isBattle) maybeRevealCharactersFromWar(cityController(target.id), campaign, reports);
      if (isBattle) completeFirstMilitaryOrderAfterResolved('battle', reports);
      return campaign;
    }

    function createNpcCampaign({ faction, source, target, troops: amount, routeMode = 'official' }, reports = []) {
      if (!canNpcFactionAttackTarget(faction, target)) return null;
      const route = findCampaignRoute(source, target, 'official');
      if (!route) return null;
      const campaign = {
        id: 'campaign_' + uid(), faction, type: 'attack', objective: 'capture', source, target, route, routeMode,
        tactic: 'balanced', army: troops(Math.round(amount * 0.66), Math.round(amount * 0.12), Math.round(amount * 0.22), 0),
        commander: factionName(faction) + '军将', status: 'marching', phase: '行军', eta: calculateTravelTurns(route, { troops: amount, supply: 6 }),
        travelRemaining: calculateTravelTurns(route, { troops: amount, supply: 6 }), siegeRemaining: 2, supply: 7, risk: 1, slotOccupied: true, createdTurn: gameState.turn
      };
      gameState.campaigns.push(campaign);
      if (isControlledBy(target, 'player')) addUrgentMatter({ type: 'enemyMarch', campaignId: campaign.id, title: '敌军逼近 ' + regionName(target), text: factionName(faction) + '军正向' + regionName(target) + '进军。' });
      reports.push({ tone: 'bad', text: factionName(faction) + '军自' + regionName(source) + '向' + regionName(target) + '进军，ETA ' + campaign.eta + ' 回合。' });
      maybeRevealCharactersFromWar(faction, campaign, reports);
      maybeRevealCharactersFromWar(cityController(target), campaign, reports);
      return campaign;
    }

    function consumeCampaignSupply(campaign) {
      campaign.supply = Math.max(0, campaign.supply - 1);
      if (campaign.supply === 0) {
        const loss = Math.max(20, Math.round(realTroops(campaign.army) * 0.08));
        removeTroops(campaign.army, loss);
        playCampaignFeedbackEffect(campaign, ['我军断粮', '兵力 -' + fmt(loss)]);
      }
    }

    function advanceCampaigns(reports) {
      gameState.campaigns.forEach(campaign => {
        if (!isActiveCampaign(campaign)) return;
        consumeCampaignSupply(campaign);
        if (finishCampaignIfArmyGone(campaign, reports, '粮尽兵散')) return;
        if (campaign.status === 'marching') {
          campaign.travelRemaining = Math.max(0, campaign.travelRemaining - 1);
          campaign.phase = '行军';
          if (campaign.travelRemaining <= 0) resolveTravel(campaign, reports);
          return;
        }
        if (campaign.status === 'siege') {
          const target = gameState.cities[campaign.target];
          if (!target) return;
          const before = {
            food: Number(target.food || 0),
            morale: Number(target.morale || 0)
          };
          campaign.siegeRemaining = Math.max(0, campaign.siegeRemaining - 1);
          target.food = Math.max(0, target.food - Math.max(80, Math.round(realTroops(campaign.army) * 0.08)));
          target.morale = clamp(target.morale - 3, 0, 100);
          playBattleEffect(campaign.target);
          playCampaignFeedbackEffect(campaign, buildCampaignFeedbackLines({
            targetFoodLoss: before.food - Number(target.food || 0),
            targetMoraleLoss: before.morale - Number(target.morale || 0)
          }));
          if (campaign.siegeRemaining <= 0 || target.morale <= 18 || target.defense <= 12) resolveSiege(campaign, reports);
        }
      });
    }

    function resolveTravel(campaign, reports) {
      if (campaign.type === 'transfer') {
        addTroops(gameState.cities[campaign.target].garrison, campaign.army);
        campaign.status = 'complete';
        campaign.phase = '已抵达';
        reports.push({ tone: 'good', text: regionName(campaign.target) + '收到增援 ' + fmt(realTroops(campaign.army)) + '。' });
        return;
      }
      // 检查目标城池归属是否已变更（多方争城场景）
      const currentOwner = cityController(campaign.target);
      if (currentOwner === campaign.faction) {
        // 自己势力已拿下该城，转入驻防
        const targetCity = gameState.cities[campaign.target];
        if (targetCity) {
          addTroops(targetCity.garrison, campaign.army);
        }
        campaign.status = 'complete';
        campaign.phase = '驻防完成';
        reports.push({ tone: 'good', text: factionName(campaign.faction) + '军抵达' + regionName(campaign.target) + '，该城已归本势力，转为驻防。' });
        return;
      }
      if (campaign.faction === 'player' && currentOwner !== 'player') {
        campaign.status = 'siege';
        campaign.phase = '围城';
        campaign.siegeRemaining = Math.max(2, campaign.siegeRemaining || 2);
        playBattleEffect(campaign.target);
        reports.push({ tone: 'good', text: regionName(campaign.target) + '已被视为敌对城池，我军抵达城下并展开围城。' });
        return;
      }
      if (currentOwner !== 'local' && currentOwner !== campaign.faction) {
        const hostility = getFactionHostility(campaign.faction, currentOwner);
        if (hostility < -10) {
          // 敌对，继续围城（转攻新占据者）
          campaign.status = 'siege';
          campaign.phase = '围城';
          campaign.siegeRemaining = Math.max(2, campaign.siegeRemaining || 2);
          playBattleEffect(campaign.target);
          reports.push({ tone: 'bad', text: regionName(campaign.target) + '已落入' + factionName(currentOwner) + '之手，' + factionName(campaign.faction) + '军转攻新占据者，进入围城阶段。' });
          if (isControlledBy(campaign.target, 'player')) addUrgentMatter({ type: 'siege', campaignId: campaign.id, title: regionName(campaign.target) + '被围', text: factionName(campaign.faction) + '军已抵达城下，转攻我方。' });
          return;
        } else {
          // 不敌对，撤军
          campaign.status = 'retreated';
          campaign.phase = '撤军';
          reports.push({ tone: 'warn', text: factionName(campaign.faction) + '军抵达' + regionName(campaign.target) + '，但城池已易主且非敌对，决定撤军。' });
          return;
        }
      }
      // 正常情况：目标仍是敌对势力
      campaign.status = 'siege';
      campaign.phase = '围城';
      campaign.siegeRemaining = Math.max(2, campaign.siegeRemaining || 2);
      playBattleEffect(campaign.target);
      reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: regionName(campaign.target) + '进入围城阶段，至少还需 ' + campaign.siegeRemaining + ' 回合。' });
      if (isControlledBy(campaign.target, 'player')) addUrgentMatter({ type: 'siege', campaignId: campaign.id, title: regionName(campaign.target) + '被围', text: factionName(campaign.faction) + '军已抵达城下。' });
    }

    function resolveSiege(campaign, reports) {
      const source = gameState.cities[campaign.source];
      const target = gameState.cities[campaign.target];
      if (!source || !target) return;
      if (!campaign.publicUnrestChecked) {
        campaign.publicUnrestChecked = true;
        const unrestMod = getPublicSupportBattleModifier(target, campaign.faction);
        target.morale = clamp(target.morale - unrestMod.moralePenalty, 0, 100);
        // 情报泄露判定：攻城过程中触发泄密
        if (Math.random() < unrestMod.intelligenceLeakChance) {
          triggerIntelligenceLeak(target, reports, { toFaction: campaign.faction });
        }
        if (Math.random() < unrestMod.openGateChance) {
          target.defense = clamp(target.defense - 18, 0, 100);
          target.morale = clamp(target.morale - 18, 0, 100);
          removeTroops(target.garrison, Math.round(realTroops(target.garrison) * 0.18));
          // 民心为0时，开城/倒戈触发守军叛逃
          const ps = Number(target.publicSupport || 0);
          if (ps <= 0) {
            const defectorCount = Math.round(realTroops(target.garrison) * 0.14);
            const defectors = extractTroops(target.garrison, defectorCount);
            if (realTroops(defectors) > 0) {
              addTroops(campaign.army, defectors);
              reports.push({ tone: 'bad', level: 'critical', text: target.name + '民心归零，城中守军临阵倒戈，' + fmt(realTroops(defectors)) + '人投入攻方阵营。' });
            }
          }
          reports.push({ tone: 'bad', level: 'critical', text: target.name + '民心崩溃，城中有人暗通敌军，守备大乱。' });
        }
      }
      const draft = { troops: realTroops(campaign.army), route: campaign.routeMode, tactic: campaign.tactic, objective: campaign.objective };
      const power = estimateBattlePower(draft, Object.assign({}, source, { food: Math.max(1, campaign.supply * 220), morale: source.morale }), target);
      // 情报泄露给进攻方带来攻城优势
      const leakBonus = getActiveIntelligenceLeakBonus(campaign.faction, target.id).siegeAdvantage;
      const ratio = power.attack * (0.86 + Math.random() * 0.28 + leakBonus) / Math.max(1, power.defense * (0.9 + Math.random() * 0.22));
      const win = ratio >= 1.02;
      const beforeArmy = realTroops(campaign.army);
      const beforeTarget = {
        troops: realTroops(target.garrison),
        morale: Number(target.morale || 0),
        defense: Number(target.defense || 0),
        food: Number(target.food || 0),
        population: Number(target.population || 0),
        money: Number(target.money || 0),
        order: Number(target.order || 0),
        publicSupport: Number(target.publicSupport || 0)
      };
      const tacticLossMods = {
        balanced: { own: 1, target: 1 },
        assault: { own: 1.22, target: 1.18 },
        siege: { own: 0.86, target: 0.82 },
        feint: { own: 0.78, target: 0.72 },
        reserve: { own: 0.62, target: 0.58 }
      };
      const lossMod = tacticLossMods[campaign.tactic] || tacticLossMods.balanced;
      removeTroops(campaign.army, Math.round(realTroops(campaign.army) * (win ? 0.2 : 0.36) * lossMod.own));
      removeTroops(target.garrison, Math.round(realTroops(target.garrison) * (win ? 0.54 : 0.22) * lossMod.target));
      target.warDamage = clamp(target.warDamage + (win ? 18 : 9), 0, 100);
      target.morale = clamp(target.morale + (win ? -12 : 3), 0, 100);
      const playerLoss = Math.max(0, beforeArmy - realTroops(campaign.army));
      const battleDefender = cityController(target.id);
      if (win && campaign.objective === 'capture') {
        const oldController = cityController(target.id);
        captureRegion(target.id, campaign.faction, reports, { prestige: campaign.faction === 'player' ? 7 : 0, alert: 12, select: campaign.faction === 'player' });
        addTroops(target.garrison, campaign.army);
        reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: '战报：' + target.name + '陷落，旗帜已经更换。' });
        if (oldController === 'player' && campaign.faction !== 'player') playCityLostEffect(target.id);
      } else if (win) {
        if (campaign.faction !== 'player') addTroops(gameState.cities[campaign.source].garrison, campaign.army);
        if (campaign.objective === 'contain') {
          target.disrupted = clamp((target.disrupted || 0) + 18, 0, 100);
          target.morale = clamp(target.morale - 8, 0, 100);
          reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: '战报：' + target.name + '被成功牵制，守军调动受阻，士气继续下滑。' });
        } else if (campaign.objective === 'exhaust') {
          const extraLoss = Math.max(60, Math.round(realTroops(target.garrison) * 0.16));
          removeTroops(target.garrison, extraLoss);
          target.defense = clamp(target.defense - 8, 0, 100);
          reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: '战报：' + target.name + '守军被大量消耗，城防也遭到破坏。' });
        } else if (campaign.objective === 'supply') {
          target.food = Math.max(0, target.food - Math.max(260, Math.round(target.food * 0.24)));
          target.disrupted = clamp((target.disrupted || 0) + 24, 0, 100);
          target.morale = clamp(target.morale - 6, 0, 100);
          reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: '战报：' + target.name + '粮道被切断，城中粮草与军心同时受挫。' });
        } else {
          reports.push({ tone: campaign.faction === 'player' ? 'good' : 'bad', text: '战报：' + target.name + '城外战斗得胜，攻方按既定目标收兵。' });
        }
      } else {
        if (campaign.faction !== 'player') addTroops(gameState.cities[campaign.source].garrison, campaign.army);
        reports.push({ tone: campaign.faction === 'player' ? 'warn' : 'good', text: '战报：' + target.name + '守住城池，攻方收兵。' });
      }
      applyCampaignTacticEffects(campaign, target, win);
      campaign.lastBattleDeltas = buildCampaignDeltaRecord(campaign, beforeArmy, beforeTarget, target, win, ratio);
      playCampaignFeedbackEffect(campaign, buildCampaignFeedbackLines({
        playerLoss,
        targetLoss: Math.max(0, beforeTarget.troops - realTroops(target.garrison)),
        targetMoraleLoss: Math.max(0, beforeTarget.morale - Number(target.morale || 0)),
        targetDefenseLoss: Math.max(0, beforeTarget.defense - Number(target.defense || 0)),
        targetFoodLoss: Math.max(0, beforeTarget.food - Number(target.food || 0)),
        targetPopulationLoss: Math.max(0, beforeTarget.population - Number(target.population || 0)),
        targetMoneyLoss: Math.max(0, beforeTarget.money - Number(target.money || 0)),
        targetOrderLoss: Math.max(0, beforeTarget.order - Number(target.order || 0)),
        targetSupportLoss: Math.max(0, beforeTarget.publicSupport - Number(target.publicSupport || 0)),
        note: win ? '攻势有效' : '攻势受挫'
      }));
      if (finishCampaignIfArmyGone(campaign, reports, '攻城损耗殆尽')) {
        gameState.battleReports.unshift({ turn: gameState.turn, source: regionName(campaign.source), target: target.name, win: false, ratio: fmtPercent(ratio) });
        return;
      }
      if (win && campaign.objective === 'capture') {
        campaign.status = 'complete';
        campaign.phase = '破城';
      } else if (campaign.faction === 'player') {
        campaign.status = 'siege';
        campaign.phase = win ? '继续围城' : '围城受挫';
        campaign.siegeRemaining = 1;
        reports.push({ tone: win ? 'good' : 'warn', text: target.name + '战役仍在持续。军令不可撤回，前线部队将继续作战。' });
      } else {
        campaign.status = 'complete';
        campaign.phase = win ? '破城' : '撤退';
      }
      gameState.battleReports.unshift({ turn: gameState.turn, source: regionName(campaign.source), target: target.name, win, ratio: fmtPercent(ratio) });
      evaluateRedemptionAfterBattle(campaign, target, { win, defender: battleDefender }, reports);
    }

    function evaluateRedemptionAfterBattle(campaign, target, result, reports = []) {
      if (!isStoryMode() || !campaign || campaign.faction !== 'player' || !target) return;
      if (target.id === 'jiangxia' && result.defender === 'liubiao' && result.win) {
        maybeTriggerRedemptionLine('huangZu', { reason: 'jiangxiaDefeat', cityId: target.id });
      }
      if (target.id === 'changsha' && result.win && controlledCities().some(city => city.id === 'changsha')) {
        maybeTriggerRedemptionLine('weiYan', { reason: 'changshaTaken', cityId: target.id });
        if (Number(gameState.player.prestige || 0) >= 22 || Number(target.publicSupport || 0) >= 50) {
          maybeTriggerRedemptionLine('huangZhong', { reason: 'changshaSettled', cityId: target.id });
        }
      }
      if (target.id === 'jiangxia' && result.win && (redemptionState().huangZu?.choice === 'redeem' || gameState.player.prestige >= 35)) {
        maybeTriggerRedemptionLine('ganNing', { reason: 'jiangxiaWaterways', cityId: target.id });
      }
      if (result.win && result.defender === 'liubiao' && gameState.characters.caiMao?.suspicion >= 58 && gameState.player.legitimacy >= 52) {
        maybeTriggerRedemptionLine('caiMao', { reason: 'liubiaoFrontShaken', cityId: target.id });
      }
    }

    function processStoryRedemptionOpportunities(reports = []) {
      if (!isStoryMode()) return;
      const liuBiaoPlot = gameState.plotLineStates?.liu_biao;
      if (liuBiaoPlot && hasPlotNode(liuBiaoPlot, 'lb_3_2')) {
        maybeTriggerRedemptionLine('liuQi', { reason: 'successionCrisis' });
      }
      if (
        Number(gameState.characters.caiMao?.suspicion || 0) >= 62
        && Number(gameState.player.legitimacy || 0) >= 52
        && controlledCities().length >= 3
      ) {
        maybeTriggerRedemptionLine('caiMao', { reason: 'gentryBargain' });
      }
      if (
        Number(gameState.player.legitimacy || 0) >= 58
        && Number(gameState.characters.wenPin?.trust || 0) >= 45
        && (redemptionState().huangZu?.resolved || controlledCities().length >= 3)
      ) {
        maybeTriggerRedemptionLine('wenPin', { reason: 'keptFaith' });
      }
      if (
        liuBiaoPlot
        && hasPlotNode(liuBiaoPlot, 'lb_3_3')
        && Number(gameState.player.legitimacy || 0) >= 55
        && Number(gameState.characters.jingnanGentry?.suspicion || 0) <= 58
        && !gameState.player.independent
      ) {
        maybeTriggerRedemptionLine('kuaiYue', { reason: 'successionBalance' });
      }
      if (
        (redemptionState().huangZu?.resolved || redemptionState().ganNing?.resolved)
        && gameState.turn - Number(redemptionState().sunResponse?.turn || 0) > 4
      ) {
        maybeTriggerRedemptionLine('sunResponse', { reason: 'jiangxiaAftermath' });
      }
      const plague = storyPlagueState();
      if (Number(plague.lastOutbreakTurn || 0) > 0 && gameState.turn - Number(plague.lastOutbreakTurn || 0) <= 3 && !playerHealers().length) {
        maybeTriggerRedemptionLine('huaTuo', { reason: 'plagueAftermath' });
      }
      const guanduPlot = gameState.plotLineStates?.guandu;
      const guandu = guanduPlot ? guanduState(guanduPlot) : null;
      if (guanduPlot && hasPlotNode(guanduPlot, 'gd_2_yuan_letter') && gameState.turn - Number(redemptionState().tianFeng?.turn || 0) > 4) {
        maybeTriggerRedemptionLine('tianFeng', { reason: 'yuanCounsel', guanduChoice: guanduPlot.triggeredNodes?.gd_2_yuan_letter?.turn });
      }
      if (guanduPlot && hasPlotNode(guanduPlot, 'gd_4_baima')) {
        maybeTriggerRedemptionLine('guanYu', { reason: 'baimaFame', yanLiangFate: guandu?.fates?.yanLiang || '' });
      }
      if (guanduPlot && hasPlotNode(guanduPlot, 'gd_5_wuchao')) {
        if (guandu?.fates?.xuYou && !redemptionState().xuYou?.resolved) {
          maybeTriggerRedemptionLine('xuYou', { reason: 'wuchaoTurn', fate: guandu.fates.xuYou });
        }
        if (!guandu?.fates?.zhangHe && !redemptionState().zhangHe?.resolved) {
          maybeTriggerRedemptionLine('zhangHe', { reason: 'yuanCampDoubt' });
        }
      }
      if (guanduPlot && hasPlotNode(guanduPlot, 'gd_6_result')) {
        const resultName = guandu?.result?.name || '';
        if ((resultName === '曹操逆胜' || guandu?.allianceChoice === 'cao') && !redemptionState().xunYu?.resolved) {
          maybeTriggerRedemptionLine('xunYu', { reason: 'caoVictoryOrder', guanduResult: resultName });
        }
        if (Number(guandu?.caoScore || 0) >= 4 && !redemptionState().guoJia?.resolved) {
          maybeTriggerRedemptionLine('guoJia', { reason: 'guanduRead', guanduResult: resultName });
        }
      }
    }

    function requestRelief(campaignId, cityId) {
      const campaign = gameState.campaigns.find(item => item.id === campaignId);
      const source = controlledCities().find(city => city.id !== cityId && realTroops(city.garrison) > 450);
      if (!campaign || !source) return toast('暂无可调援军');
      const order = { id: uid(), type: 'transfer', label: source.name + '增援' + regionName(cityId), payload: { source: source.id, target: cityId, troops: Math.min(600, realTroops(source.garrison) - 300), route: 'official' } };
      createMilitaryOrder(order, gameState.turnEvents);
      toast('增援军令已发出');
      render();
    }

    function launchDiversionAttack(campaignId, targetId) {
      const source = getCampaignSource(targetId);
      if (!source) return toast('没有可用于围魏救赵的出兵城');
      openBattlePlanner(targetId);
      toast('已打开转攻部署，请选择兵力与路线');
    }

    function retreatCampaign(campaignId) {
      toast('军令已定，玩家军队不能撤军。');
    }

    function addUrgentMatter(data) {
      const matter = Object.assign({ id: uid(), resolved: false, turn: gameState.turn }, data);
      gameState.urgentMatters.push(matter);
      pushTurnEvent({ level: 'critical', tone: 'bad', text: matter.title + '：' + matter.text });
      return matter;
    }

    function storyPlagueState() {
      gameState.storyFlags ||= {};
      gameState.storyFlags.plagueState ||= { activeByCity: {}, lastCheckTurn: 0, lastOutbreakTurn: 0 };
      gameState.storyFlags.plagueState.activeByCity ||= {};
      return gameState.storyFlags.plagueState;
    }

    function redemptionState() {
      gameState.storyFlags ||= {};
      gameState.storyFlags.redemptionLines ||= {};
      return gameState.storyFlags.redemptionLines;
    }

    function playerHealers() {
      return Object.values(gameState.characterRoster || {}).filter(character => (
        character
        && character.type === '医者'
        && (character.status === 'recruited' || character.faction === 'player')
      ));
    }

    function healerBuffLevel() {
      const healers = playerHealers();
      if (!healers.length) return 0;
      const legendary = healers.some(character => character.rarity === '传奇' || character.id === 'huaTuo');
      return clamp(healers.length + (legendary ? 2 : 0), 1, 5);
    }

    function cityPlagueLevel(cityId) {
      return clamp(Number(storyPlagueState().activeByCity?.[cityId] || 0), 0, 100);
    }

    function setCityPlagueLevel(cityId, value) {
      const state = storyPlagueState();
      const next = clamp(Math.round(Number(value || 0)), 0, 100);
      if (next <= 0) delete state.activeByCity[cityId];
      else state.activeByCity[cityId] = next;
      const city = gameState.cities[cityId];
      if (city) city.plague = next;
      return next;
    }

    function plagueRiskForCity(city) {
      if (!city || !isControlledBy(city.id, 'player')) return 0;
      const supportRisk = clamp((55 - Number(city.publicSupport || 0)) / 55, 0, 1) * 0.035;
      const orderRisk = clamp((58 - Number(city.order || 0)) / 58, 0, 1) * 0.03;
      const foodNeed = Math.max(900, realTroops(city.garrison) * 1.2);
      const foodRisk = Number(city.food || 0) < foodNeed ? 0.018 : 0;
      const warRisk = Number(city.warDamage || 0) > 20 ? clamp(Number(city.warDamage || 0) / 100, 0, 1) * 0.026 : 0;
      const siegeRisk = activeCampaignsTargetingCity(city.id).length ? 0.018 : 0;
      const populationRisk = Number(city.population || 0) > 52000 ? 0.012 : 0;
      const activeRisk = cityPlagueLevel(city.id) > 0 ? 0.022 : 0;
      const healerMitigation = healerBuffLevel() * 0.01;
      return clamp(0.006 + supportRisk + orderRisk + foodRisk + warRisk + siegeRisk + populationRisk + activeRisk - healerMitigation, 0.002, 0.12);
    }

    function processStoryPlague(reports = []) {
      if (!isStoryMode() || gameState.turn < 8) return;
      const state = storyPlagueState();
      if (Number(state.lastCheckTurn || 0) === gameState.turn) return;
      state.lastCheckTurn = gameState.turn;

      Object.entries({ ...(state.activeByCity || {}) }).forEach(([cityId, level]) => {
        const city = gameState.cities[cityId];
        if (!city || !isControlledBy(cityId, 'player')) {
          delete state.activeByCity[cityId];
          return;
        }
        const healer = healerBuffLevel();
        const next = clamp(Number(level || 0) + 4 - healer * 3, 0, 100);
        setCityPlagueLevel(cityId, next);
        if (next > 0) {
          const populationLoss = Math.round(Number(city.population || 0) * clamp(next / 1000, 0.002, 0.028));
          city.population = Math.max(800, Number(city.population || 0) - populationLoss);
          city.publicSupport = clamp(Number(city.publicSupport || 0) - clamp(Math.round(next / 20), 1, 5), 0, 100);
          city.order = clamp(Number(city.order || 0) - clamp(Math.round(next / 26), 0, 4), 0, 100);
          reports.push({ tone: 'bad', level: next >= 60 ? 'critical' : 'important', text: city.name + '疫病未平，人口 -' + fmt(populationLoss) + '，民心与治安受损。' });
        } else {
          reports.push({ tone: 'good', text: city.name + '疫气渐散，城中秩序开始恢复。' });
        }
      });

      const unresolved = (gameState.urgentMatters || []).some(item => !item.resolved && item.type === 'plague');
      if (unresolved || gameState.turn - Number(state.lastOutbreakTurn || 0) < 5) return;
      const candidates = controlledCities()
        .map(city => ({ city, risk: plagueRiskForCity(city) }))
        .sort((a, b) => b.risk - a.risk);
      const candidate = candidates[0];
      if (!candidate || Math.random() >= candidate.risk) return;
      state.lastOutbreakTurn = gameState.turn;
      const severity = clamp(Math.round(28 + candidate.risk * 420 + Math.random() * 18), 22, 72);
      setCityPlagueLevel(candidate.city.id, Math.max(cityPlagueLevel(candidate.city.id), severity));
      addUrgentMatter({
        type: 'plague',
        cityId: candidate.city.id,
        severity,
        title: candidate.city.name + '瘟疫入城',
        text: '城中疫气骤起，医药、粮草、军纪与民心都在同一回合承压。处理得当可以赢得民望，隐瞒或拖延则可能让疫情扩散。'
      });
    }

    function resolvePlagueMatter(matter, choice) {
      const city = gameState.cities[matter.cityId];
      if (!city) return;
      const level = Math.max(cityPlagueLevel(city.id), Number(matter.severity || 32));
      const healers = playerHealers();
      const healerLevel = healerBuffLevel();
      const hasHealer = healerLevel > 0;
      const lines = [];

      if (choice === 'quarantine') {
        setCityPlagueLevel(city.id, level - 34);
        city.publicSupport = clamp(Number(city.publicSupport || 0) - 6, 0, 100);
        city.order = clamp(Number(city.order || 0) + 5, 0, 100);
        city.money = Math.max(0, Number(city.money || 0) - 70);
        lines.push('你下令封坊设卡，疫势被压住，但百姓怨气上升。');
      } else if (choice === 'granary') {
        setCityPlagueLevel(city.id, level - 26 - healerLevel * 4);
        city.food = Math.max(0, Number(city.food || 0) - 520);
        city.money = Math.max(0, Number(city.money || 0) - 140);
        city.publicSupport = clamp(Number(city.publicSupport || 0) + 9, 0, 100);
        gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 2, 0, 100);
        lines.push('你开仓施药，民心回稳，合法性略升。');
      } else if (choice === 'healer') {
        const reduction = hasHealer ? 48 + healerLevel * 6 : 18;
        setCityPlagueLevel(city.id, level - reduction);
        city.morale = clamp(Number(city.morale || 0) + (hasHealer ? 5 : 1), 0, 100);
        city.publicSupport = clamp(Number(city.publicSupport || 0) + (hasHealer ? 6 : 2), 0, 100);
        if (hasHealer) {
          healers.forEach(healer => addCharacterMemory(healer, { summary: '在' + city.name + '瘟疫中救治军民，医名更盛。' }));
          lines.push(healers[0].name + '主持疫所，药方奏效，军民伤亡大减。');
        } else {
          lines.push('城中医者不足，只能临时征调草泽郎中，疫势略缓。');
        }
      } else if (choice === 'liubiao') {
        const canAsk = Number(gameState.player.protection || 0) >= 35 && !gameState.player.independent;
        setCityPlagueLevel(city.id, level - (canAsk ? 30 : 12));
        if (canAsk) {
          city.food += 260;
          gameState.player.protection = clamp(Number(gameState.player.protection || 0) - 8, 0, 100);
          gameState.characters.liuBiao.trust = clamp(Number(gameState.characters.liuBiao.trust || 0) - 4, 0, 100);
          lines.push('你向襄阳求取医药，刘表拨来药粮，但庇护与信任被消耗。');
        } else {
          city.publicSupport = clamp(Number(city.publicSupport || 0) - 3, 0, 100);
          lines.push('襄阳支援有限，百姓看出你已难借刘表之力。');
        }
      } else if (choice === 'conceal') {
        setCityPlagueLevel(city.id, level - 8);
        gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) + 12, 0, 100);
        city.order = clamp(Number(city.order || 0) - 5, 0, 100);
        storyPlagueState().concealedTurn = gameState.turn;
        lines.push('你压下疫报，短期避免外敌窥伺，但士族疑心与城中暗流都在上升。');
      } else if (choice === 'military') {
        setCityPlagueLevel(city.id, level - 22 - healerLevel * 2);
        city.morale = clamp(Number(city.morale || 0) - 6, 0, 100);
        city.order = clamp(Number(city.order || 0) + 7, 0, 100);
        removeTroops(city.garrison, Math.round(realTroops(city.garrison) * 0.035));
        lines.push('你以军法隔离营伍，疫情扩散减缓，但军心和兵员都受损。');
      }

      const remaining = cityPlagueLevel(city.id);
      const tone = remaining <= 0 ? 'good' : remaining >= 55 ? 'bad' : 'warn';
      pushTurnEvent({ tone, level: remaining >= 55 ? 'critical' : 'important', text: lines.join('') + ' 当前疫病 ' + remaining + '/100。' });
      if (choice === 'healer' && !hasHealer) {
        maybeTriggerRedemptionLine('huaTuo', { reason: 'plague', cityId: city.id });
      }
    }

    function maybeTriggerRedemptionLine(lineId, context = {}) {
      if (!isStoryMode()) return false;
      const lines = redemptionState();
      if (lines[lineId]?.offered || lines[lineId]?.resolved) return false;
      const data = {
        huangZu: {
          senderId: 'huangZu',
          title: '败将求生',
          body: '江夏旧将黄祖被你逼到退路。他自知旧怨难消，却仍说水路不可一日无将。若给他一条赎罪路，他愿以江夏水军挡住下一次风浪。',
          choices: [
            { id: 'redeem', label: '留守江夏赎罪' },
            { id: 'imprison', label: '收押审问水路' },
            { id: 'execute', label: '斩首示众' }
          ]
        },
        weiYan: {
          senderId: 'weiYan',
          title: '孤将请战',
          body: '长沙军中有一员勇悍之将，名魏延。他不愿做被旧门第压住的偏将，只求一场能证明自己的战功。重用他，会得锋刃，也会惹来议论。',
          choices: [
            { id: 'trial', label: '给他独立战功' },
            { id: 'restrain', label: '收为偏将约束' },
            { id: 'reject', label: '压下此人' }
          ]
        },
        liuQi: {
          senderId: 'liuQi',
          title: '长公子求援',
          body: '刘琦遣人密来，言蔡氏之势日重，襄阳已难容他久居。他不求夺权，只求一条能活下去、也能保住荆州名分的路。',
          choices: [
            { id: 'escort', label: '护送出镇江夏' },
            { id: 'support', label: '公开支持刘琦' },
            { id: 'neutral', label: '只给暗中盘缠' }
          ]
        },
        caiMao: {
          senderId: 'caiMao',
          title: '权门退路',
          body: '蔡瑁终于派人试探：若你愿保蔡氏宗族与水军旧部不被清算，他可以交出一部分襄阳人事与水军名册。此举能稳局，也会让人质疑你与权门妥协。',
          choices: [
            { id: 'bargain', label: '保族换权' },
            { id: 'coerce', label: '逼其交权' },
            { id: 'purge', label: '准备清算蔡氏' }
          ]
        },
        ganNing: {
          senderId: 'ganNing',
          title: '锦帆求名',
          body: '锦帆贼甘宁听闻你给败将留路，遣人投书。他不愿再做江上盗名之人，只求一战立功，洗去旧迹。',
          choices: [
            { id: 'oath', label: '立功赎罪' },
            { id: 'recruit', label: '直接招安' },
            { id: 'release', label: '放他自去' }
          ]
        },
        huaTuo: {
          senderId: 'huaTuo',
          title: '医者夜访',
          body: '疫病之后，一位游医夜至府门，自称华佗。他不求官爵，只求药材、疫所与不被权贵拘束的自由。',
          choices: [
            { id: 'invite', label: '请为客卿医者' },
            { id: 'fund', label: '资助行医不拘留' },
            { id: 'ignore', label: '婉拒入府' }
          ]
        },
        wenPin: {
          senderId: 'wenPin',
          title: '守信之将',
          body: '文聘遣人送来一封军牒：荆州将倾，最怕的不是强敌，而是号令反复、赏罚无信。若你能守约安民，他愿把军心押在你身上。',
          choices: [
            { id: 'oath', label: '以军令立誓' },
            { id: 'frontier', label: '留其守边' },
            { id: 'doubt', label: '暂不交心' }
          ]
        },
        kuaiYue: {
          senderId: 'kuaiYue',
          title: '谋臣下注',
          body: '蒯越私下送来一卷襄阳人事。卷末只写一句：若新局能保荆州不乱，士族也会选择活路。你知道这是一次下注。',
          choices: [
            { id: 'accept', label: '接纳蒯越下注' },
            { id: 'promise', label: '许以安州之约' },
            { id: 'refuse', label: '不受士族牵制' }
          ]
        },
        huangZhong: {
          senderId: 'huangZhong',
          title: '老将不伏',
          body: '长沙既定，一名老将仍每日挽弓校射。他说年岁不该决定一个人的结局，若你愿给他战场，他愿用余勇证明自己。',
          choices: [
            { id: 'invite', label: '请老将出山' },
            { id: 'trial', label: '设射礼试锋' },
            { id: 'retire', label: '厚礼遣归' }
          ]
        },
        sunResponse: {
          senderId: 'sunQuan',
          title: '江东来书',
          body: '江东使者抵达。黄祖、甘宁与江夏水路的选择已经传到孙氏耳中。孙权不急着翻脸，只问你：江上旧怨，究竟要如何了结？',
          choices: [
            { id: 'appease', label: '遣使释怨' },
            { id: 'defy', label: '强硬回书' },
            { id: 'trade', label: '以水路互市' }
          ]
        },
        tianFeng: {
          senderId: 'tianFeng',
          title: '囚门死谏',
          body: '田丰在邺城狱中托人送来一片竹简：袁军若急胜，必败于粮道；若能忍辱缓进，曹操未必不可破。他不求脱罪，只求有人把正确的话送到能听见的人耳中。',
          choices: [
            { id: 'rescue', label: '设法救出田丰' },
            { id: 'deliver', label: '转送死谏给袁营' },
            { id: 'silence', label: '按下此信不发' }
          ]
        },
        xuYou: {
          senderId: 'xuYou',
          title: '乌巢谋价',
          body: '许攸派人送来一句话：乌巢之火能烧袁，也能烧曹；真正值钱的不是粮屯，而是谁愿意给他一个足够体面的席位。',
          choices: [
            { id: 'buy', label: '重金买断许攸' },
            { id: 'expose', label: '公开其反复无常' },
            { id: 'sendCao', label: '放他去见曹操' }
          ]
        },
        zhangHe: {
          senderId: 'zhangHe',
          title: '巧变择主',
          body: '张郃遣亲信试探：战场形势瞬息万变，最怕主帅不听变通。他不求你立刻招纳，只问若有一日袁营错判，你是否容得下一名临阵改计之将。',
          choices: [
            { id: 'recruit', label: '许以将位相招' },
            { id: 'safePassage', label: '只给退路不收人' },
            { id: 'reject', label: '拒绝临阵易主之人' }
          ]
        },
        xunYu: {
          senderId: 'xunYu',
          title: '王佐汉心',
          body: '荀彧的书信措辞极稳，却字字有锋：官渡若胜，曹操会更近天下一步；但天下秩序究竟应归于汉室，还是归于强臣，终须有人提前立下边界。',
          choices: [
            { id: 'hanMandate', label: '承诺尊汉室名义' },
            { id: 'pragmatic', label: '只谈安民不谈名分' },
            { id: 'ambition', label: '暗示强者自取天下' }
          ]
        },
        guoJia: {
          senderId: 'guoJia',
          title: '鬼才病酒',
          body: '郭嘉来信极短：官渡胜负已近，他却问你一件旁事，若一个聪明人明知酒色伤身，是否还该为了看尽天下大势而继续燃烧自己？',
          choices: [
            { id: 'physician', label: '遣医者劝其养病' },
            { id: 'strategy', label: '请其留下北征遗策' },
            { id: 'indulge', label: '纵其快意而行' }
          ]
        },
        guanYu: {
          senderId: 'guanYu',
          title: '白马义还',
          body: '白马一战后，关羽声名震动曹袁。他仍记刘备旧义，也知曹操厚待。若你愿递出一条路，他或许能更早归义，也可能改变刘备之后的命运。',
          choices: [
            { id: 'returnLiuBei', label: '助其归还刘备' },
            { id: 'inviteJingzhou', label: '邀其过境荆州' },
            { id: 'keepCao', label: '劝其暂留曹营' }
          ]
        }
      }[lineId];
      if (!data) return false;
      lines[lineId] = Object.assign({ offered: true, turn: gameState.turn }, context);
      const sender = gameState.characterRoster[data.senderId];
      if (sender && sender.status === 'hidden') sender.status = 'rumored';
      createLetter({
        senderId: data.senderId,
        title: data.title,
        body: data.body,
        critical: true,
        kind: 'redemption',
        meta: { lineId, context },
        choices: data.choices
      });
      return true;
    }

    function resolveGuanduPlotChoice(state, nodeId, choiceId, reports = []) {
      const gd = guanduState(state);
      const addCao = amount => { gd.caoScore = Number(gd.caoScore || 0) + amount; };
      const addYuan = amount => { gd.yuanScore = Number(gd.yuanScore || 0) + amount; };
      const relation = (factionId, amount) => {
        const record = ensureDiplomacyRecord(factionId);
        record.relation = clamp(Number(record.relation || 0) + amount, 0, 100);
      };
      const fate = (id, text, faction = null) => {
        gd.fates[id] = text;
        setCharacterFate(id, text, faction, reports);
      };

      if (nodeId === 'gd_2_cao_letter') {
        if (choiceId === 'aidCaoFood') {
          addCao(3);
          relation('cao', 10);
          const city = controlledCities()[0];
          if (city) city.food = Math.max(0, Number(city.food || 0) - 240);
          reports.push({ tone: 'good', text: '你暗助曹操粮道，曹军官渡续战能力提高。' });
        } else if (choiceId === 'aidCaoIntel') {
          addCao(4);
          relation('cao', 8);
          gd.playerStance = 'leanCao';
          reports.push({ tone: 'good', text: '你送出袁军布防情报，曹操更容易抓住官渡破绽。' });
        } else if (choiceId === 'misleadCao') {
          addYuan(3);
          relation('cao', -10);
          reports.push({ tone: 'warn', text: '你以假情报误导曹操，许昌若察觉，日后会记下这笔账。' });
        } else {
          relation('cao', -2);
          reports.push({ tone: 'warn', text: '你婉拒曹操密信，许昌暂时把你列为观望势力。' });
        }
      }

      if (nodeId === 'gd_2_yuan_letter') {
        if (choiceId === 'adviseYuanSlow') {
          addYuan(4);
          relation('yuan', 8);
          gd.playerStance = gd.playerStance === 'leanCao' ? 'doubleGame' : 'leanYuan';
          reports.push({ tone: 'good', text: '你劝袁绍缓进耗曹，沮授一派的战略空间上升。' });
        } else if (choiceId === 'urgeYuanAttack') {
          addCao(2);
          relation('yuan', 4);
          reports.push({ tone: 'warn', text: '你催袁绍急攻许昌，河北声势虽盛，却更容易暴露粮道。' });
        } else if (choiceId === 'saveTianFeng') {
          addYuan(2);
          relation('yuan', 6);
          fate('tianFeng', '免死下狱');
          reports.push({ tone: 'good', text: '你为田丰求情，他暂免死罪，袁营保留一条直谏之声。' });
        } else {
          relation('yuan', -2);
          reports.push({ tone: 'warn', text: '你不卷入河北军议，袁绍认为你仍在审势。' });
        }
      }

      if (nodeId === 'gd_3_alliances') {
        const allianceMap = {
          allyLiuBei: ['liu', 'liuBei', '仁义盟'],
          allySunQuan: ['sun', 'sunQuan', '江上盟'],
          allyCaoCao: ['cao', 'caoCao', '许昌盟'],
          allyYuanShao: ['yuan', 'yuanShao', '河北盟']
        };
        if (allianceMap[choiceId]) {
          const [factionId, lordId, pactName] = allianceMap[choiceId];
          const lord = gameState.characterRoster?.[lordId] || getLordCharacterByFaction(factionId);
          ensureDiplomacyRecord(factionId).relation = clamp(Number(ensureDiplomacyRecord(factionId).relation || 0) + 12, 0, 100);
          formAllianceWithFaction(factionId, { lord, initiator: 'npc', relationBonus: 10 });
          ensureDiplomacyRecord(factionId).pact = '盟友';
          ensureDiplomacyRecord(factionId).alliance.name = pactName;
          gd.allianceChoice = factionId;
          if (factionId === 'cao') addCao(2);
          if (factionId === 'yuan') addYuan(2);
          reports.push({ tone: 'good', level: 'important', text: '你接受' + factionName(factionId) + '的结盟邀请，缔结“' + pactName + '”。' });
        } else {
          gd.allianceChoice = 'none';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 2, 0, 100);
          reports.push({ tone: 'warn', text: '你暂不公开结盟，各方都把你视为官渡胜负后的关键变量。' });
        }
      }

      if (nodeId === 'gd_4_baima') {
        if (choiceId === 'warnYanLiang') {
          addYuan(3);
          fate('yanLiang', '白马脱险', 'yuan');
          relation('yuan', 5);
        } else if (choiceId === 'letYanLiangDie') {
          addCao(3);
          fate('yanLiang', '战死');
          relation('cao', 5);
        } else if (choiceId === 'saveWenChou') {
          addYuan(2);
          fate('wenChou', '延津脱险', 'yuan');
          relation('yuan', 4);
        } else if (choiceId === 'ambushBoth') {
          addCao(1);
          addYuan(1);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 5, 0, 100);
          gd.fates.yanLiang = '受伤未死';
          gd.fates.wenChou = '撤军失势';
          reports.push({ tone: 'warn', text: '你设伏同时削弱曹袁，声望上升，但两边都开始提防你。' });
          relation('cao', -4);
          relation('yuan', -4);
        }
      }

      if (nodeId === 'gd_5_wuchao') {
        if (choiceId === 'burnWuchao') {
          addCao(6);
          fate('xuYou', '投曹献策', 'cao');
          fate('juShou', '被俘不降', 'yuan');
          relation('cao', 10);
        } else if (choiceId === 'guardWuchao') {
          addYuan(6);
          fate('xuYou', '失计被疑', 'yuan');
          fate('juShou', '缓进得用', 'yuan');
          relation('yuan', 10);
        } else if (choiceId === 'interceptXuYou') {
          addCao(1);
          addYuan(1);
          fate('xuYou', '被你扣留', 'player');
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 4, 0, 100);
          reports.push({ tone: 'warn', text: '你截下许攸，把乌巢情报变成自己的筹码。曹袁胜负因此更难预料。' });
        } else if (choiceId === 'recruitZhangHe') {
          addCao(2);
          fate('zhangHe', '转投玩家', 'player');
          fate('gaoLan', '随张郃观望', 'player');
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 6, 0, 100);
          reports.push({ tone: 'good', text: '你提前接住张郃、高览的退路，河北巧变之将不再必然归曹。' });
        }
      }
    }

    function getStoryCharacter(characterId) {
      return gameState.characterRoster?.[characterId] || gameState.characters?.[characterId] || null;
    }

    function ensureStoryCharacterState(characterId) {
      gameState.characters ||= {};
      if (!gameState.characters[characterId]) {
        const rosterCharacter = gameState.characterRoster?.[characterId] || {};
        gameState.characters[characterId] = {
          id: characterId,
          name: rosterCharacter.name || characterId,
          status: rosterCharacter.status || 'hidden',
          trust: Number(rosterCharacter.trust || rosterCharacter.trustPlayer || 0),
          suspicion: Number(rosterCharacter.suspicion || rosterCharacter.suspicionOfPlayer || 0),
          authority: Number(rosterCharacter.authority || 0)
        };
      }
      return gameState.characters[characterId];
    }

    function setStoryCharacterStatus(characterId, status) {
      const character = ensureStoryCharacterState(characterId);
      character.status = status;
      if (gameState.characterRoster?.[characterId]) {
        gameState.characterRoster[characterId].status = status;
      }
      return character;
    }

    function recruitHistoricalCharacter(characterId, reports = []) {
      const character = getStoryCharacter(characterId);
      if (!character) return null;
      character.status = 'recruited';
      character.faction = 'player';
      character.loyalty = clamp(Number(character.loyalty || 50) + 10, 0, 100);
      character.trustPlayer = clamp(Number(character.trustPlayer || 35) + 18, 0, 100);
      character.suspicionOfPlayer = clamp(Number(character.suspicionOfPlayer || 20) - 10, 0, 100);
      reports.push({ tone: 'good', level: 'important', text: character.name + '加入你的麾下。' });
      return character;
    }

    function resolveRedemptionLetter(letter, choiceId, reports = []) {
      const lineId = letter.meta?.lineId;
      const lines = redemptionState();
      const line = lines[lineId] ||= {};
      line.resolved = true;
      line.choice = choiceId;
      line.resolvedTurn = gameState.turn;

      if (lineId === 'huangZu') {
        if (choiceId === 'redeem') {
          const hz = recruitHistoricalCharacter('huangZu', reports);
          if (hz) {
            hz.status = '赎守江夏';
            hz.specialSchemes = uniqueTextList([...(hz.specialSchemes || []), '江夏水屏']);
          }
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 5, 0, 100);
          maybeTriggerRedemptionLine('ganNing', { reason: 'huangZuRedeemed' });
        } else if (choiceId === 'imprison') {
          gameState.characters.retinue.network = clamp(Number(gameState.characters.retinue.network || 0) + 10, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 2, 0, 100);
          reports.push({ tone: 'warn', text: '黄祖被收押，江夏水路情报落入你手中。' });
        } else {
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 5, 0, 100);
          gameState.diplomacy.sun ||= { relation: 30, pact: '未接触' };
          gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) + 8, 0, 100);
          reports.push({ tone: 'bad', text: '黄祖伏诛，江东对你的敌意暂缓，荆州旧将却人人自危。' });
        }
      } else if (lineId === 'weiYan') {
        if (choiceId === 'trial') {
          const wy = recruitHistoricalCharacter('weiYan', reports);
          if (wy) {
            wy.status = '待立奇功';
            wy.specialSchemes = uniqueTextList([...(wy.specialSchemes || []), '奇兵夺门']);
          }
          gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) + 8, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 4, 0, 100);
        } else if (choiceId === 'restrain') {
          recruitHistoricalCharacter('weiYan', reports);
          gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) + 3, 0, 100);
          reports.push({ tone: 'warn', text: '魏延得用却受节制，锋芒暂被压住。' });
        } else {
          gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) - 4, 0, 100);
          reports.push({ tone: 'warn', text: '你压下魏延，士族稍安，但一柄锋刃从此远去。' });
        }
      } else if (lineId === 'liuQi') {
        ensureStoryCharacterState('liuQi');
        ensureStoryCharacterState('caiMao');
        if (choiceId === 'escort') {
          gameState.characters.liuQi.status = '出镇江夏';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 8, 0, 100);
          gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) + 12, 0, 100);
          reports.push({ tone: 'good', text: '刘琦出镇江夏，荆州继承局势出现新的正统支点。' });
        } else if (choiceId === 'support') {
          gameState.characters.liuQi.status = '公开受援';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 11, 0, 100);
          applyProtectionDecay(10, '你公开介入刘表二子之争', reports);
        } else {
          gameState.characters.liuQi.status = '暗中求存';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 3, 0, 100);
          reports.push({ tone: 'warn', text: '你只给刘琦一条暗路，正统名分未明，但祸端也暂未扩大。' });
        }
      } else if (lineId === 'caiMao') {
        if (choiceId === 'bargain') {
          gameState.characters.caiMao.status = '保族交权';
          gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) - 18, 0, 100);
          gameState.characters.jingnanGentry.trust = clamp(Number(gameState.characters.jingnanGentry.trust || 0) + 8, 0, 100);
          gameState.cities.xiangyang && (gameState.cities.xiangyang.intel = clamp(Number(gameState.cities.xiangyang.intel || 0) + 25, 0, 100));
          reports.push({ tone: 'good', text: '蔡氏交出部分人事与水军名册，襄阳局势趋稳。' });
        } else if (choiceId === 'coerce') {
          gameState.characters.caiMao.status = '被迫交权';
          gameState.characters.caiMao.suspicion = clamp(Number(gameState.characters.caiMao.suspicion || 0) + 8, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 4, 0, 100);
          reports.push({ tone: 'warn', text: '蔡瑁被迫退让，但蔡氏旧部暗中记恨。' });
        } else {
          gameState.characters.caiMao.status = '清算在即';
          gameState.characters.caiMao.suspicion = 100;
          gameState.player.ambition = clamp(Number(gameState.player.ambition || 0) + 8, 0, 100);
          reports.push({ tone: 'bad', text: '你准备清算蔡氏，荆州权门再无回头路。' });
        }
      } else if (lineId === 'ganNing') {
        if (choiceId === 'oath' || choiceId === 'recruit') {
          const gn = recruitHistoricalCharacter('ganNing', reports);
          if (gn) {
            gn.status = choiceId === 'oath' ? '立功赎罪' : '锦帆归附';
            gn.specialSchemes = uniqueTextList([...(gn.specialSchemes || []), '锦帆夜袭']);
          }
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + (choiceId === 'oath' ? 5 : 3), 0, 100);
        } else {
          gameState.diplomacy.sun ||= { relation: 30, pact: '未接触' };
          gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) - 5, 0, 100);
          reports.push({ tone: 'warn', text: '甘宁顺江而去。将来江东若得此人，水路会更难安。' });
        }
      } else if (lineId === 'huaTuo') {
        if (choiceId === 'invite') {
          const ht = recruitHistoricalCharacter('huaTuo', reports);
          if (ht) ht.status = '客卿医者';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 6, 0, 100);
        } else if (choiceId === 'fund') {
          const city = controlledCities()[0];
          if (city) city.money = Math.max(0, Number(city.money || 0) - 180);
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 3, 0, 100);
          reports.push({ tone: 'good', text: '你资助华佗行医，虽不入府，荆州民间仍记你的善举。' });
        } else {
          reports.push({ tone: 'warn', text: '华佗离去，医者线暂时中断。' });
        }
      } else if (lineId === 'wenPin') {
        if (choiceId === 'oath') {
          const wp = recruitHistoricalCharacter('wenPin', reports);
          if (wp) {
            wp.status = '守信归心';
            wp.specialSchemes = uniqueTextList([...(wp.specialSchemes || []), '守城不动']);
          }
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 6, 0, 100);
          controlledCities().forEach(city => { city.morale = clamp(Number(city.morale || 0) + 2, 0, 100); });
          reports.push({ tone: 'good', text: '文聘归心，荆州军中开始相信你的军令。' });
        } else if (choiceId === 'frontier') {
          gameState.characters.wenPin.status = '守边观望';
          const frontier = controlledCities().find(city => cityNeighborIds(city.id).some(id => !isControlledBy(id, 'player')));
          if (frontier) frontier.defense = clamp(Number(frontier.defense || 0) + 8, 0, 100);
          reports.push({ tone: 'good', text: '文聘暂守边地，前线防务更稳，但仍未彻底改换门庭。' });
        } else {
          gameState.characters.wenPin.status = '守信未决';
          reports.push({ tone: 'warn', text: '你没有接住文聘的试探，守信线暂时停在军门之外。' });
        }
      } else if (lineId === 'kuaiYue') {
        if (choiceId === 'accept' || choiceId === 'promise') {
          const ky = recruitHistoricalCharacter('kuaiYue', reports);
          if (ky) {
            ky.status = choiceId === 'promise' ? '安州盟约' : '暗中下注';
            ky.specialSchemes = uniqueTextList([...(ky.specialSchemes || []), '襄阳内应']);
          }
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + (choiceId === 'promise' ? 7 : 4), 0, 100);
          gameState.characters.jingnanGentry.trust = clamp(Number(gameState.characters.jingnanGentry.trust || 0) + 9, 0, 100);
          if (gameState.cities.xiangyang) gameState.cities.xiangyang.intel = clamp(Number(gameState.cities.xiangyang.intel || 0) + 30, 0, 100);
          reports.push({ tone: 'good', text: '蒯越下注，你获得襄阳内局与继承风向的关键情报。' });
        } else {
          gameState.player.ambition = clamp(Number(gameState.player.ambition || 0) + 5, 0, 100);
          gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) + 8, 0, 100);
          reports.push({ tone: 'warn', text: '你拒绝蒯越，士族开始判断你更像一位独断之主。' });
        }
      } else if (lineId === 'huangZhong') {
        if (choiceId === 'invite' || choiceId === 'trial') {
          const hz = recruitHistoricalCharacter('huangZhong', reports);
          if (hz) {
            hz.status = choiceId === 'trial' ? '射礼立名' : '老将出山';
            hz.specialSchemes = uniqueTextList([...(hz.specialSchemes || []), '百步穿杨']);
          }
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + (choiceId === 'trial' ? 6 : 4), 0, 100);
          reports.push({ tone: 'good', text: '黄忠出山，长沙旧军看见了新的战功之路。' });
        } else {
          gameState.characters.huangZhong.status = '厚礼归隐';
          gameState.characters.jingnanGentry.trust = clamp(Number(gameState.characters.jingnanGentry.trust || 0) + 4, 0, 100);
          reports.push({ tone: 'warn', text: '黄忠受礼归隐，士族称你知礼，却少了一员老将。' });
        }
      } else if (lineId === 'sunResponse') {
        gameState.diplomacy.sun ||= { relation: 30, pact: '未接触' };
        if (choiceId === 'appease') {
          gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) + 10, 0, 100);
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 2, 0, 100);
          reports.push({ tone: 'good', text: '你遣使释怨，江东暂缓水路压力。' });
        } else if (choiceId === 'trade') {
          gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) + 5, 0, 100);
          controlledCities().forEach(city => { if (city.resource && /港|水|江|商/.test(city.resource + city.terrain)) city.commerce = clamp(Number(city.commerce || 0) + 3, 0, 100); });
          reports.push({ tone: 'good', text: '你以水路互市稳住江东，沿江城池商业略有起色。' });
        } else {
          gameState.diplomacy.sun.relation = clamp(Number(gameState.diplomacy.sun.relation || 0) - 12, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 5, 0, 100);
          reports.push({ tone: 'warn', text: '你强硬回书，声望上涨，但江东水军记住了这份锋芒。' });
        }
      } else if (lineId === 'tianFeng') {
        const guanduPlot = gameState.plotLineStates?.guandu;
        const gd = guanduPlot ? guanduState(guanduPlot) : null;
        if (choiceId === 'rescue') {
          const tf = recruitHistoricalCharacter('tianFeng', reports);
          if (tf) tf.status = '死谏获救';
          if (gd) {
            gd.yuanScore = Number(gd.yuanScore || 0) - 1;
            gd.fates.tianFeng = '被玩家救出';
          }
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 5, 0, 100);
          reports.push({ tone: 'good', text: '田丰脱出邺狱，但袁营少了一道能纠偏的直谏。' });
        } else if (choiceId === 'deliver') {
          const tf = getStoryCharacter('tianFeng');
          if (tf) tf.status = '死谏留名';
          if (gd) {
            gd.yuanScore = Number(gd.yuanScore || 0) + 4;
            gd.fates.tianFeng = '谏书入营';
          }
          ensureDiplomacyRecord('yuan').relation = clamp(Number(ensureDiplomacyRecord('yuan').relation || 0) + 5, 0, 100);
          reports.push({ tone: 'good', text: '田丰谏书送入袁营，若袁绍尚能听进一句，官渡胜负便会偏移。' });
        } else {
          const tf = getStoryCharacter('tianFeng');
          if (tf) tf.status = '囚门无声';
          if (gd) {
            gd.caoScore = Number(gd.caoScore || 0) + 2;
            gd.fates.tianFeng = '谏言被压下';
          }
          reports.push({ tone: 'warn', text: '田丰之信被按下，河北少了一次避免败局的机会。' });
        }
      } else if (lineId === 'xuYou') {
        const guanduPlot = gameState.plotLineStates?.guandu;
        const gd = guanduPlot ? guanduState(guanduPlot) : null;
        if (choiceId === 'buy') {
          const xy = recruitHistoricalCharacter('xuYou', reports);
          if (xy) xy.status = '谋价归附';
          if (gd) {
            gd.caoScore = Number(gd.caoScore || 0) - 2;
            gd.yuanScore = Number(gd.yuanScore || 0) - 1;
            gd.fates.xuYou = '被玩家买断';
          }
          const city = controlledCities()[0];
          if (city) city.money = Math.max(0, Number(city.money || 0) - 260);
          reports.push({ tone: 'warn', text: '许攸被你买下，乌巢情报成为你的筹码，但此人贪功难驯。' });
        } else if (choiceId === 'expose') {
          const xy = getStoryCharacter('xuYou');
          if (xy) xy.status = '反复败露';
          if (gd) {
            gd.yuanScore = Number(gd.yuanScore || 0) + 2;
            gd.fates.xuYou = '被揭穿';
          }
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 3, 0, 100);
          reports.push({ tone: 'good', text: '你公开许攸反复之态，袁营暂时堵住乌巢破口。' });
        } else {
          const xy = getStoryCharacter('xuYou');
          if (xy) xy.status = '投曹献策';
          if (gd) {
            gd.caoScore = Number(gd.caoScore || 0) + 3;
            gd.fates.xuYou = '放归曹营';
          }
          ensureDiplomacyRecord('cao').relation = clamp(Number(ensureDiplomacyRecord('cao').relation || 0) + 6, 0, 100);
          reports.push({ tone: 'warn', text: '你放许攸去见曹操，乌巢之火更近一步。' });
        }
      } else if (lineId === 'zhangHe') {
        const guanduPlot = gameState.plotLineStates?.guandu;
        const gd = guanduPlot ? guanduState(guanduPlot) : null;
        if (choiceId === 'recruit') {
          const zh = recruitHistoricalCharacter('zhangHe', reports);
          const gl = recruitHistoricalCharacter('gaoLan', reports);
          if (zh) zh.status = '巧变归心';
          if (gl) gl.status = '随友归心';
          if (gd) {
            gd.fates.zhangHe = '转投玩家';
            gd.fates.gaoLan = '随张郃归附';
            gd.caoScore = Number(gd.caoScore || 0) - 1;
          }
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 6, 0, 100);
        } else if (choiceId === 'safePassage') {
          const zh = getStoryCharacter('zhangHe');
          const gl = getStoryCharacter('gaoLan');
          if (zh) zh.status = '留路观望';
          if (gl) gl.status = '随军观望';
          if (gd) {
            gd.fates.zhangHe = '得退路未归附';
            gd.fates.gaoLan = '随张郃观望';
          }
          reports.push({ tone: 'good', text: '你给张郃、高览留下一条退路，未来北方线仍可再接此缘。' });
        } else {
          const zh = getStoryCharacter('zhangHe');
          const gl = getStoryCharacter('gaoLan');
          if (zh) {
            zh.status = '另投曹营';
            zh.faction = 'cao';
          }
          if (gl) {
            gl.status = '另投曹营';
            gl.faction = 'cao';
          }
          if (gd) {
            gd.caoScore = Number(gd.caoScore || 0) + 2;
            gd.fates.zhangHe = '归曹';
            gd.fates.gaoLan = '归曹';
          }
          reports.push({ tone: 'warn', text: '你拒绝临阵易主之人，张郃、高览仍会按原本大势寻找曹操。' });
        }
      } else if (lineId === 'xunYu') {
        if (choiceId === 'hanMandate') {
          const xy = getStoryCharacter('xunYu');
          if (xy) xy.status = '汉心相许';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 8, 0, 100);
          ensureDiplomacyRecord('cao').relation = clamp(Number(ensureDiplomacyRecord('cao').relation || 0) + 4, 0, 100);
          reports.push({ tone: 'good', text: '荀彧记下你的尊汉承诺。日后若曹操越过名分边界，他可能重新评估你。' });
        } else if (choiceId === 'pragmatic') {
          const xy = getStoryCharacter('xunYu');
          if (xy) xy.status = '观政待断';
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 3, 0, 100);
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 2, 0, 100);
          reports.push({ tone: 'warn', text: '你避开汉室名分，只谈安民。荀彧不反感，却也未完全交心。' });
        } else {
          const xy = getStoryCharacter('xunYu');
          if (xy) xy.status = '疑你有篡心';
          gameState.player.ambition = clamp(Number(gameState.player.ambition || 0) + 8, 0, 100);
          gameState.characters.jingnanGentry.suspicion = clamp(Number(gameState.characters.jingnanGentry.suspicion || 0) + 5, 0, 100);
          reports.push({ tone: 'warn', text: '你暗示强者自取天下，荀彧对你生出深疑。' });
        }
      } else if (lineId === 'guoJia') {
        const healer = playerHealers()[0];
        if (choiceId === 'physician') {
          const gj = getStoryCharacter('guoJia');
          if (gj) gj.status = healer ? '病势暂缓' : '劝医未果';
          if (healer) addCharacterMemory(healer, { summary: '曾为郭嘉调理病体，延缓鬼才早逝之势。' });
          ensureDiplomacyRecord('cao').relation = clamp(Number(ensureDiplomacyRecord('cao').relation || 0) + 5, 0, 100);
          reports.push({ tone: healer ? 'good' : 'warn', text: healer ? '医者介入，郭嘉病势暂缓，未来北征线可能改变。' : '你劝郭嘉养病，但麾下无名医，效果有限。' });
        } else if (choiceId === 'strategy') {
          const gj = getStoryCharacter('guoJia');
          if (gj) gj.status = '遗策成卷';
          gameState.characters.retinue.network = clamp(Number(gameState.characters.retinue.network || 0) + 8, 0, 100);
          ensureDiplomacyRecord('cao').relation = clamp(Number(ensureDiplomacyRecord('cao').relation || 0) + 4, 0, 100);
          reports.push({ tone: 'good', text: '郭嘉留下北征遗策，你的情报网络读懂了曹军后续方向。' });
        } else {
          const gj = getStoryCharacter('guoJia');
          if (gj) gj.status = '快意燃尽';
          gameState.player.prestige = clamp(Number(gameState.player.prestige || 0) + 3, 0, 100);
          reports.push({ tone: 'warn', text: '你纵其快意，郭嘉更愿与你论势，却仍向早逝命运靠近。' });
        }
      } else if (lineId === 'guanYu') {
        if (choiceId === 'returnLiuBei') {
          const gy = getStoryCharacter('guanYu');
          if (gy) {
            gy.status = '千里归义';
            gy.faction = 'liu';
          }
          ensureDiplomacyRecord('liu').relation = clamp(Number(ensureDiplomacyRecord('liu').relation || 0) + 12, 0, 100);
          gameState.player.legitimacy = clamp(Number(gameState.player.legitimacy || 0) + 4, 0, 100);
          reports.push({ tone: 'good', text: '你助关羽归还刘备，刘备势力对你大增好感。' });
        } else if (choiceId === 'inviteJingzhou') {
          const gy = getStoryCharacter('guanYu');
          if (gy) gy.status = '过境荆州';
          ensureDiplomacyRecord('liu').relation = clamp(Number(ensureDiplomacyRecord('liu').relation || 0) + 6, 0, 100);
          gameState.characters.retinue.network = clamp(Number(gameState.characters.retinue.network || 0) + 5, 0, 100);
          reports.push({ tone: 'good', text: '关羽过境荆州，刘备线、荆州线之间多了一道可用桥梁。' });
        } else {
          const gy = getStoryCharacter('guanYu');
          if (gy) gy.status = '暂留曹营';
          ensureDiplomacyRecord('cao').relation = clamp(Number(ensureDiplomacyRecord('cao').relation || 0) + 5, 0, 100);
          reports.push({ tone: 'warn', text: '你劝关羽暂留曹营，曹操记你识大体，刘备归义线则被推迟。' });
        }
      }
    }

    function resolveUrgentMatter(matterId, choice) {
      const matter = gameState.urgentMatters.find(item => item.id === matterId);
      if (!matter) return;
      matter.resolved = choice !== 'later';
      matter.choice = choice;
      const campaign = gameState.campaigns.find(item => item.id === matter.campaignId);
      if (matter.type === 'plague' && choice !== 'later') resolvePlagueMatter(matter, choice);
      if (choice === 'relief' && campaign) requestRelief(campaign.id, campaign.target);
      if (choice === 'hold' && campaign) gameState.cities[campaign.target].defense = clamp(gameState.cities[campaign.target].defense + 4, 0, 100);
      if (choice === 'supply' && campaign) campaign.supply = Math.max(0, campaign.supply - 2);
      if (choice === 'support') {
        const lb = gameState.characters.liuBiao;
        const gy = gameState.cities[gameState.player.startingCity || 'guiyang'];
        gy.food += 700;
        gy.garrison.infantry += 100;
        lb.trust = clamp(lb.trust - 3, 0, 100);
      }
      if (choice !== 'later') addNews('warn', '紧急事务已处理：' + matter.title);
      gameState.activeModal = null;
      openNextCriticalModal();
      saveToStorage(false);
      render();
    }

    function playMarchEffect(order) {
      playSfx('march');
      return order;
    }

    function playBattleEffect(cityId) {
      gameState.visualEffects.push({ id: uid(), type: 'battle', cityId, expiresAt: Date.now() + 1800 });
      playSfx('battle');
      renderFxLayer();
      setTimeout(() => renderFxLayer(), 1900);
    }

    function applyCampaignTacticEffects(campaign, target, win) {
      if (!campaign || !target) return;
      const armySize = Math.max(100, realTroops(campaign.army));
      const winScale = win ? 1 : 0.55;
      const popLoss = rate => Math.round(clamp(Number(target.population || 0) * rate * winScale, 0, Math.max(180, armySize * 1.8)));
      const foodLoss = rate => Math.round(clamp(Number(target.food || 0) * rate * winScale + armySize * 0.04, 40, Math.max(80, Number(target.food || 0))));
      const moneyLoss = rate => Math.round(clamp(Number(target.money || 0) * rate * winScale, 0, Math.max(0, Number(target.money || 0))));
      const troopLoss = rate => Math.round(realTroops(target.garrison) * rate * winScale);

      const effects = {
        balanced: { defense: 3, morale: 4, food: 0.05, troops: 0.05, order: 1.5, support: 1, population: 0.0008, money: 0.015 },
        assault: { defense: 9, morale: 7, food: 0.04, troops: 0.1, order: 3, support: 3, population: 0.0026, money: 0.025 },
        siege: { defense: 3, morale: 9, food: 0.2, troops: 0.04, order: 4, support: 2.5, population: 0.0032, money: 0.01 },
        feint: { defense: 2, morale: 11, food: 0.06, troops: 0.035, order: 7, support: 1.8, population: 0.0006, money: 0.02 },
        reserve: { defense: 1.5, morale: 3, food: 0.035, troops: 0.025, order: 1, support: 0.6, population: 0.0003, money: 0.006 }
      };
      const objectives = {
        capture: { defense: 4, morale: 4, food: 0.03, troops: 0.04, order: 2, support: 1.5, population: 0.001, money: 0.012 },
        contain: { defense: 1, morale: 7, food: 0.04, troops: 0.025, order: 7, support: 1, population: 0.0004, money: 0.01 },
        exhaust: { defense: 8, morale: 4, food: 0.04, troops: 0.12, order: 2, support: 1, population: 0.0008, money: 0.006 },
        supply: { defense: 1, morale: 7, food: 0.22, troops: 0.025, order: 5, support: 2.5, population: 0.0022, money: 0.018 }
      };
      const effect = effects[campaign.tactic] || effects.balanced;
      const objective = objectives[campaign.objective] || objectives.capture;
      const sum = key => (Number(effect[key] || 0) + Number(objective[key] || 0)) * winScale;

      removeTroops(target.garrison, troopLoss(Number(effect.troops || 0) + Number(objective.troops || 0)));
      target.defense = clamp(Number(target.defense || 0) - sum('defense'), 0, 100);
      target.morale = clamp(Number(target.morale || 0) - sum('morale'), 0, 100);
      target.food = Math.max(0, Number(target.food || 0) - foodLoss(Number(effect.food || 0) + Number(objective.food || 0)));
      target.money = Math.max(0, Number(target.money || 0) - moneyLoss(Number(effect.money || 0) + Number(objective.money || 0)));
      target.population = Math.max(8000, Number(target.population || 0) - popLoss(Number(effect.population || 0) + Number(objective.population || 0)));
      target.order = clamp(Number(target.order || 0) - sum('order'), 0, 100);
      target.publicSupport = clamp(Number(target.publicSupport || 0) - sum('support'), 0, 100);
      target.warDamage = clamp(Number(target.warDamage || 0) + (win ? 7 : 4), 0, 100);
    }

    function buildCampaignDeltaRecord(campaign, beforeArmy, beforeTarget, target, win, ratio) {
      return {
        turn: gameState.turn,
        tactic: campaign.tactic,
        objective: campaign.objective,
        win,
        ratio: fmtPercent(ratio),
        playerLoss: Math.max(0, beforeArmy - realTroops(campaign.army)),
        targetLoss: Math.max(0, beforeTarget.troops - realTroops(target.garrison)),
        moraleLoss: Math.max(0, beforeTarget.morale - Number(target.morale || 0)),
        defenseLoss: Math.max(0, beforeTarget.defense - Number(target.defense || 0)),
        foodLoss: Math.max(0, beforeTarget.food - Number(target.food || 0)),
        populationLoss: Math.max(0, beforeTarget.population - Number(target.population || 0)),
        moneyLoss: Math.max(0, beforeTarget.money - Number(target.money || 0)),
        orderLoss: Math.max(0, beforeTarget.order - Number(target.order || 0)),
        supportLoss: Math.max(0, beforeTarget.publicSupport - Number(target.publicSupport || 0))
      };
    }

    function buildCampaignFeedbackLines(delta = {}) {
      const lines = [];
      if (delta.playerLoss > 0) lines.push('我军 -' + fmt(delta.playerLoss));
      if (delta.targetLoss > 0) lines.push('守军 -' + fmt(delta.targetLoss));
      if (delta.targetMoraleLoss > 0) lines.push('士气 -' + fmt(delta.targetMoraleLoss));
      if (delta.targetDefenseLoss > 0) lines.push('城防 -' + fmt(delta.targetDefenseLoss));
      if (delta.targetFoodLoss > 0) lines.push('粮草 -' + fmt(delta.targetFoodLoss));
      if (delta.targetPopulationLoss > 0) lines.push('人口 -' + fmt(delta.targetPopulationLoss));
      if (delta.targetMoneyLoss > 0) lines.push('府库 -' + fmt(delta.targetMoneyLoss));
      if (delta.targetOrderLoss > 0) lines.push('治安 -' + fmt(delta.targetOrderLoss));
      if (delta.targetSupportLoss > 0) lines.push('民心 -' + fmt(delta.targetSupportLoss));
      if (delta.note) lines.push(delta.note);
      return lines.slice(0, 8);
    }

    function playCampaignFeedbackEffect(campaign, lines) {
      if (!campaign || !Array.isArray(lines) || !lines.length) return;
      gameState.visualEffects.push({
        id: uid(),
        type: 'campaignFeedback',
        cityId: campaign.target,
        lines,
        expiresAt: Date.now() + 3200
      });
      renderFxLayer();
      setTimeout(() => renderFxLayer(), 3300);
    }

    function playCityCapturedEffect(cityId, oldController, newController) {
      gameState.visualEffects.push({ id: uid(), type: 'capture', cityId, oldController, newController, expiresAt: Date.now() + 2400 });
      playSfx('city_captured');
      renderFxLayer();
      setTimeout(() => renderFxLayer(), 2500);
    }

    function playCityLostEffect(cityId) {
      const center = getRegion(cityId)?.center || gameState.cities[cityId];
      if (center) setMapFocusOn(center.x, center.y, 2.65);
      gameState.visualEffects.push({ id: uid(), type: 'lost', cityId, expiresAt: Date.now() + 2600 });
      playSfx('city_lost');
      renderFxLayer();
      setTimeout(() => renderFxLayer(), 2700);
    }

    function playSfx(type) {
      try {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        playSfx.context ||= new Audio();
        const ctx = playSfx.context;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const tones = { march: 220, battle: 110, city_captured: 440, city_lost: 92, delta_good: 520, delta_bad: 150 };
        oscillator.frequency.value = tones[type] || 260;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
      } catch (error) {
        console.warn('SFX unavailable:', error);
      }
    }

    // ===================== 背景音乐系统 =====================

    function updateMusicButtonUI() {
      const btn = document.getElementById('btnMusic');
      if (!btn) return;
      if (bgMusicPlaying) {
        btn.textContent = '♪';
        btn.title = '暂停音乐';
        btn.classList.add('playing');
      } else {
        btn.textContent = '♫';
        btn.title = '播放音乐';
        btn.classList.remove('playing');
      }
    }

    function getBgMusic() {
      return document.getElementById('bgMusic');
    }

    function pauseBgm() {
      bgmPlaybackToken += 1;
      const audio = getBgMusic();
      if (!audio || audio.paused) return;
      audio.pause();
    }

    function resumeBgm() {
      if (!bgMusicPlaying) return;
      if (isBgmLockedForAnimation()) return;
      const token = ++bgmPlaybackToken;
      const audio = getBgMusic();
      if (!audio || !audio.paused) return;
      audio.play()
        .then(() => {
          if (token !== bgmPlaybackToken || isBgmLockedForAnimation()) audio.pause();
        })
        .catch(() => {});
    }

    function playBgm({ keepEnabledOnFailure = false } = {}) {
      if (isBgmLockedForAnimation() || !canPlayBgmOnCurrentScreen()) {
        pauseBgm();
        return Promise.resolve(false);
      }
      const token = ++bgmPlaybackToken;
      const audio = getBgMusic();
      if (!audio) return Promise.resolve(false);
      audio.volume = 0.3;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        return playPromise
          .then(() => {
            if (token !== bgmPlaybackToken || isBgmLockedForAnimation() || !canPlayBgmOnCurrentScreen()) {
              audio.pause();
              return false;
            }
            bgMusicPlaying = true;
            updateMusicButtonUI();
            return true;
          })
          .catch(() => {
            if (!keepEnabledOnFailure) bgMusicPlaying = false;
            updateMusicButtonUI();
            return false;
          });
      }
      bgMusicPlaying = true;
      updateMusicButtonUI();
      return Promise.resolve(true);
    }

    function startDefaultBgm() {
      bgMusicPlaying = true;
      updateMusicButtonUI();
      if (canPlayBgmOnCurrentScreen()) playBgm({ keepEnabledOnFailure: true });
      document.addEventListener('click', unlockDefaultBgmOnInteraction, true);
      document.addEventListener('keydown', unlockDefaultBgmOnInteraction, true);
    }

    function canPlayBgmOnCurrentScreen() {
      return launchScreen === 'game' || launchScreen === 'character';
    }

    function isBgmLockedForAnimation() {
      return ['intro', 'transition', 'commissioning', 'handoff'].includes(launchScreen)
        || Boolean(openingTransitionTimer)
        || Boolean(officeHandoffTimer)
        || Boolean(document.querySelector('[data-letter-cinematic-video]'));
    }

    function unlockDefaultBgmOnInteraction(event) {
      if (event?.target instanceof Element && event.target.closest('#btnMusic')) return;
      if (!canPlayBgmOnCurrentScreen()) return;
      const audio = getBgMusic();
      if (!bgMusicPlaying || !audio || !audio.paused) return;
      playBgm({ keepEnabledOnFailure: true }).then(started => {
        if (!started) return;
        document.removeEventListener('click', unlockDefaultBgmOnInteraction, true);
        document.removeEventListener('keydown', unlockDefaultBgmOnInteraction, true);
      });
    }

    function enforceBgmAnimationLock() {
      if (!isBgmLockedForAnimation()) return;
      pauseBgm();
    }

    function toggleMusic() {
      const audio = getBgMusic();
      if (!audio) return;
      if (bgMusicPlaying && !audio.paused) {
        audio.pause();
        bgMusicPlaying = false;
      } else {
        playBgm();
        return;
      }
      updateMusicButtonUI();
    }

    // ===================== NPC势力战争系统 =====================

    function isCampaignVisibleOnMap(campaign) {
      if (!isActiveCampaign(campaign)) return false;
      if (campaign.faction === 'player') return true;
      // public/official 路线始终可见（正式出兵）
      if (campaign.routeMode === 'official') return true;
      // raid/night/stealth 需要玩家情报检测
      return canPlayerDetectHiddenCampaign(campaign);
    }

    function canPlayerDetectHiddenCampaign(campaign) {
      const network = gameState.characters?.retinue?.network || 0;
      if (network < 20) return false;
      // 检查战役源/目标城是否距离玩家控制城很近
      const playerCities = controlledCities().map(c => c.id);
      for (const cityId of playerCities) {
        const srcDist = cityReachDistance(campaign.source);
        const tgtDist = cityReachDistance(campaign.target);
        if (srcDist <= 2 || tgtDist <= 2) {
          if (network >= 45) return true;
          if (realTroops(campaign.army) > 1500 && network >= 30) return true;
          if (network >= 35 && Math.random() < 0.5) return true;
        }
      }
      if (realTroops(campaign.army) > 2500 && network >= 50) return Math.random() < 0.35;
      return false;
    }

    function getNpcControlledCities(faction) {
      return Object.values(gameState.cities)
        .filter(c => !isRemovedCityId(c.id) && isActiveMapCity(c.id) && cityController(c.id) === faction)
        .map(c => c.id);
    }

    function getNpcAttackTargets(faction, options = {}) {
      const ownCities = getNpcControlledCities(faction);
      if (ownCities.length === 0) return [];
      const targets = new Set();
      const graph = buildRouteGraph();
      for (const sourceId of ownCities) {
        const neighbors = graph[sourceId] || [];
        for (const edge of neighbors) {
          const targetId = edge.to;
          const controller = cityController(targetId);
          if (controller === faction) continue;
          // Player cities are valid targets; hostility is handled by getFactionHostility.
          if (!gameState.cities[targetId] || isRemovedCityId(targetId)) continue;
          if (!canNpcFactionAttackTarget(faction, targetId)) continue;
          const hostility = getFactionHostility(faction, controller);
          if (hostility <= -5 && edge.roadType !== 'water') {
            targets.add(targetId);
          }
        }
      }
      return [...targets];
    }

    function publicSupportTargetScore(city) {
      const ps = Number(city?.publicSupport || 0);
      if (ps <= 0) return 28;
      if (ps < 10) return 18;
      if (ps < 20) return 10;
      if (ps < 35) return 5;
      return 0;
    }

    function recentPlayerAggressionAgainst(factionId) {
      let score = 0;
      (gameState.campaigns || []).filter(isActiveCampaign).forEach(campaign => {
        if (campaign.faction !== 'player') return;
        const targetController = cityController(campaign.target);
        if (targetController === factionId) score += campaign.status === 'siege' ? 2.4 : 1.6;
      });
      (gameState.factionWarState?.recentWars || []).forEach(war => {
        if (!war || war.attacker !== 'player') return;
        if (gameState.turn - Number(war.turn || 0) > 18) return;
        const defender = war.defender || cityController(war.target);
        if (defender === factionId) {
          const age = Math.max(0, gameState.turn - Number(war.turn || 0));
          score += clamp(2.2 - age * 0.08, 0.5, 2.2);
        }
      });
      return score;
    }

    const BENEVOLENT_DEFENSIVE_FACTIONS = ['liu', 'liubiao', 'liuzhang'];

    function isBenevolentDefensiveFaction(factionId) {
      return BENEVOLENT_DEFENSIVE_FACTIONS.includes(factionId);
    }

    function canBenevolentFactionRetaliateAgainstPlayer(factionId) {
      if (!isBenevolentDefensiveFaction(factionId)) return true;
      return recentPlayerAggressionAgainst(factionId) > 0;
    }

    function canNpcFactionAttackTarget(factionId, targetId) {
      const defender = cityController(targetId);
      if (defender === 'player') {
        if (isBenevolentDefensiveFaction(factionId) && !canBenevolentFactionRetaliateAgainstPlayer(factionId)) return false;
        return canNpcTargetPlayer(factionId);
      }
      if (isBenevolentDefensiveFaction(factionId) && isBenevolentDefensiveFaction(defender)) return false;
      return true;
    }

    function enforceBenevolentDefensiveCampaignRules(reports = null) {
      let cancelled = 0;
      (gameState.campaigns || []).forEach(campaign => {
        if (!isActiveCampaign(campaign) || campaign.faction === 'player') return;
        if (canNpcFactionAttackTarget(campaign.faction, campaign.target)) return;
        campaign.status = 'cancelled';
        campaign.phase = '罢兵休战';
        campaign.slotOccupied = false;
        campaign.supply = 0;
        campaign.travelRemaining = 0;
        campaign.siegeRemaining = 0;
        cancelled += 1;
        if (reports) {
          reports.push({
            tone: 'good',
            level: 'minor',
            text: factionName(campaign.faction) + '不愿无故兴兵，撤回了前往' + regionName(campaign.target) + '的军令。'
          });
        }
      });
      return cancelled;
    }

    function syncLiuBiaoProtectionWithPlayerAttacks(reports = null) {
      if (!isStoryMode() || clamp(Number(gameState.player?.protection || 0), 0, 100) <= 0) return false;
      const hasActiveAttack = (gameState.campaigns || []).some(campaign => (
        campaign
        && campaign.faction === 'player'
        && campaign.type === 'attack'
        && isActiveCampaign(campaign)
        && cityController(campaign.target) === 'liubiao'
      ));
      if (!hasActiveAttack) return false;
      return clearLiuBiaoProtectionForPlayerAttack('liubiao', reports || []);
    }

    function liuBiaoProtectionWarDampener() {
      if (gameState.player?.independent) return 1;
      const protection = clamp(Number(gameState.player?.protection || 0), 0, 100);
      if (protection >= 85) return 0.12;
      if (protection >= 70) return 0.22;
      if (protection >= 55) return 0.42;
      if (protection >= 40) return 0.68;
      return 1;
    }

    function historicalPlayerWarPressure(factionId) {
      if (!isStoryMode()) return 0;
      const turn = Number(gameState.turn || 1);
      const playerCities = controlledCities().map(city => city.id);
      const cityCount = playerCities.length;
      const pressure = {
        liubiao: 0,
        cao: turn >= 45 ? 18 : turn >= 30 ? 8 : 0,
        sun: turn >= 28 && cityCount >= 3 ? 10 : 0,
        yuan: playerCities.some(id => ['baima', 'dongjun', 'pingyuan', 'yecheng'].includes(id)) ? 24 : 0,
        yuanshu: turn >= 18 && cityCount >= 2 ? 10 : 0,
        gongsun: playerCities.includes('pingyuan') || playerCities.includes('yecheng') ? 14 : 0,
        liubiao_local: 0
      };
      if (factionId === 'liubiao' && Number(gameState.player?.protection || 0) < 35) return 14;
      return pressure[factionId] || 0;
    }

    function getNpcPlayerWarDesire(factionId) {
      if (factionId === 'liubiao') syncLiuBiaoProtectionWithPlayerAttacks();
      const aggression = recentPlayerAggressionAgainst(factionId);
      const protection = clamp(Number(gameState.player?.protection || 0), 0, 100);
      if (isBenevolentDefensiveFaction(factionId) && aggression <= 0) {
        return {
          score: 0,
          aggression: 0,
          protection,
          protectionDampener: factionId === 'liubiao' ? liuBiaoProtectionWarDampener() : 0,
          historical: 0,
          raw: 0
        };
      }
      if (factionId === 'liubiao' && isStoryMode() && protection >= 60) {
        return {
          score: 0,
          aggression: 0,
          protection,
          protectionDampener: liuBiaoProtectionWarDampener(),
          historical: 0,
          raw: 0
        };
      }
      const protectionDampener = liuBiaoProtectionWarDampener();
      const historical = aggression > 0 ? historicalPlayerWarPressure(factionId) * 0.35 : 0;
      const basePressure = isStoryMode()
        ? (['cao', 'yuan', 'sun', 'yuanshu'].includes(factionId) ? 5 : 2)
        : (['cao', 'yuan', 'gongsun', 'sun', 'yuanshu'].includes(factionId) ? 26 : 18);
      const sandboxExpansionPressure = !isStoryMode() ? Math.max(0, controlledCities().length - 1) * 4 : 0;
      const ambitionPressure = !isStoryMode() ? clamp(Number(gameState.player?.ambition || 0) - 35, 0, 65) * 0.18 : 0;
      const grievance = aggression * 34;
      const raw = basePressure + sandboxExpansionPressure + ambitionPressure + historical + grievance;
      const protectedRaw = aggression > 0
        ? raw * clamp(0.7 + aggression * 0.18, protectionDampener, 1.3)
        : raw * protectionDampener;
      return {
        score: clamp(protectedRaw, 0, 100),
        aggression,
        protection,
        protectionDampener,
        historical,
        raw
      };
    }

    function canNpcTargetPlayer(factionId) {
      if (isBenevolentDefensiveFaction(factionId) && !canBenevolentFactionRetaliateAgainstPlayer(factionId)) return false;
      const breakState = liuBiaoBreakState();
      if (factionId === 'liubiao' && (breakState?.status === 'war' || breakState?.stage === 'war')) return true;
      if (breakState?.status === 'observing' && ['cao', 'sun'].includes(factionId) && gameState.turn <= Number(breakState.caoSunObserveUntil || 0)) {
        return false;
      }
      const desire = getNpcPlayerWarDesire(factionId);
      if (desire.aggression > 0) return desire.score >= 18;
      if (isStoryMode()) {
        if (desire.protection >= 85) return desire.score >= 8 && Math.random() < 0.08;
        if (desire.protection >= 70) return desire.score >= 8 && Math.random() < 0.14;
        if (desire.protection >= 55) return desire.score >= 8 && Math.random() < 0.26;
        return desire.score >= 8 && Math.random() < 0.42;
      }
      if (desire.protection >= 85) return desire.score >= 6 && Math.random() < 0.25;
      if (desire.protection >= 70) return desire.score >= 8 && Math.random() < 0.38;
      if (desire.protection >= 55) return desire.score >= 10 && Math.random() < 0.55;
      return desire.score >= 10;
    }

    function npcTargetScore(factionId, targetId) {
      const city = gameState.cities[targetId];
      const controller = cityController(targetId);
      const hostility = Math.abs(getFactionHostility(factionId, controller));
      const leakBonus = getActiveIntelligenceLeakBonus(factionId, targetId).targetScore;
      let score = hostility + publicSupportTargetScore(city) + leakBonus;
      if (controller === 'player') {
        const desire = getNpcPlayerWarDesire(factionId);
        score = score * 0.35 + desire.score;
        if (desire.aggression > 0) score += 18 + desire.aggression * 7;
        else score *= liuBiaoProtectionWarDampener();
      } else if (isStoryMode()) {
        const historicRivals = {
          cao: ['yuan', 'yuanshu', 'liu', 'liubiao'],
          yuan: ['cao', 'gongsun'],
          sun: ['liubiao', 'yuanshu', 'cao'],
          liu: ['cao', 'yuanshu'],
          liubiao: ['sun', 'yuanshu'],
          yuanshu: ['liu', 'cao', 'sun'],
          gongsun: ['yuan'],
          liuzhang: ['zhanglu'],
          zhanglu: ['liuzhang', 'cao'],
          mateng: ['cao', 'zhanglu']
        };
        if ((historicRivals[factionId] || []).includes(controller)) score += 18;
      }
      return score;
    }

    function getActiveIntelligenceLeakBonus(factionId, cityId) {
      const leaks = gameState.publicUnrestState?.intelligenceLeaks || [];
      const activeLeak = leaks.find(leak =>
        leak.cityId === cityId &&
        (!leak.toFaction || leak.toFaction === factionId) &&
        (gameState.turn || 0) <= (leak.expiresTurn || 0)
      );
      if (!activeLeak) return { targetScore: 0, siegeAdvantage: 0 };
      return { targetScore: 12, siegeAdvantage: 0.08 };
    }

    function getFactionHostility(factionA, factionB) {
      if (factionA === factionB) return 100;
      if ((factionA === 'player' && isPlayerAlliedWithFaction(factionB)) || (factionB === 'player' && isPlayerAlliedWithFaction(factionA))) return 80;
      if (factionA === 'player' || factionB === 'player') {
        const npcFaction = factionA === 'player' ? factionB : factionA;
        const explicit = gameState.factionRelations?.player?.[npcFaction] ?? gameState.factionRelations?.[npcFaction]?.player;
        if (Number.isFinite(Number(explicit))) return Number(explicit);
        const desire = getNpcPlayerWarDesire(npcFaction);
        return -clamp(12 + desire.score, 0, 100);
      }
      const rels = gameState.factionRelations || {};
      const row = rels[factionA] || {};
      return row[factionB] || 0;
    }

    function activeCampaignsTargetingCity(cityId) {
      return (gameState.campaigns || []).filter(campaign => {
        if (!isActiveCampaign(campaign)) return false;
        return campaign.target === cityId;
      });
    }

    function activeAttackersTargetingCity(cityId) {
      return [...new Set(activeCampaignsTargetingCity(cityId)
        .map(campaign => campaign.faction || campaign.actor || campaign.owner)
        .filter(Boolean)
      )];
    }

    function targetContestMultiplier(city) {
      if (!city) return 1;
      let score = 1;
      const strategic = city.strategic || city.strategicValue || 50;
      const neighborCount = cleanIdArray(city.neighbors || city.roads || []).length;
      const food = city.food || 0;
      const defense = city.defense || 0;
      const troopsCount = realTroops(city.garrison);
      if (strategic >= 80) score += 0.4;
      if (neighborCount >= 3) score += 0.3;
      if (food >= 1500) score += 0.2;
      if (defense <= 45) score += 0.2;
      if (troopsCount < 1200) score += 0.2;
      return score;
    }

    function canCreateAnotherCampaignAgainstTarget(factionId, targetId, options = {}) {
      const attackers = activeAttackersTargetingCity(targetId);
      // 同一势力不允许重复攻击同一个城（除非 forceSameFaction）
      if (!options.forceSameFaction && attackers.includes(factionId)) {
        return false;
      }
      // 超过最大攻击者数量，不允许（除非 forceOverrideLimit）
      if (!options.forceOverrideLimit && attackers.length >= MAX_ATTACKERS_PER_TARGET_CITY) {
        return false;
      }
      // 没有人打，正常允许
      if (attackers.length === 0) return true;
      // 强制测试允许（force / forceContest）
      if (options.force || options.forceContest) return true;
      // 已经有人打了，按概率允许形成多方争城
      const city = gameState.cities?.[targetId];
      const chance = clamp(
        MULTI_FACTION_TARGET_CHANCE * targetContestMultiplier(city),
        0.08,
        0.55
      );
      return Math.random() < chance;
    }

    function getNpcCampaignSource(faction, targetId) {
      const ownCities = getNpcControlledCities(faction);
      let bestSource = null;
      let bestTroops = 0;
      for (const cityId of ownCities) {
        const city = gameState.cities[cityId];
        const garrison = realTroops(city.garrison);
        if (garrison < 500) continue;
        const route = findCampaignRoute(cityId, targetId, 'official');
        if (!route || route.distance === 0) continue;
        if (garrison > bestTroops) {
          bestTroops = garrison;
          bestSource = cityId;
        }
      }
      return bestSource;
    }

    function shouldNpcLaunchCampaign(faction, reports) {
      const warState = gameState.factionWarState;
      const lastAttack = warState.lastAttackTurnByFaction[faction] || 0;
      if (gameState.turn - lastAttack < NPC_WAR_COOLDOWN_TURNS) return false;
      const activeNpcCampaigns = gameState.campaigns.filter(
        c => isActiveCampaign(c) && c.faction !== 'player'
      ).length;
      if (activeNpcCampaigns >= MAX_NPC_CAMPAIGNS_PER_TURN) return false;
      const targets = getNpcAttackTargets(faction);
      if (targets.length === 0) return false;
      const hasEnoughTroops = getNpcControlledCities(faction).some(cityId => {
        const city = gameState.cities[cityId];
        return city && realTroops(city.garrison) > 500;
      });
      if (!hasEnoughTroops) return false;
      const maxScore = Math.max(...targets.map(t => npcTargetScore(faction, t)));
      const hasPlayerTarget = targets.some(targetId => cityController(targetId) === 'player');
      const desire = getNpcPlayerWarDesire(faction);
      const baseChance = clamp(0.05 + maxScore / 360, 0.03, 0.5);
      const aggressionBonus = ['cao', 'yuan', 'gongsun'].includes(faction) ? 0.08 : 0;
      const protectionPenalty = hasPlayerTarget && desire.aggression <= 0 ? (1 - liuBiaoProtectionWarDampener()) * 0.18 : 0;
      const retaliationBonus = desire.aggression > 0 ? clamp(desire.aggression * 0.08, 0.06, 0.22) : 0;
      const chance = clamp(baseChance + aggressionBonus + retaliationBonus - protectionPenalty, 0.02, 0.58);
      return Math.random() < chance;
    }

    function createNpcCampaignPlan(faction, options = {}) {
      const rawTargets = getNpcAttackTargets(faction, options);
      if (rawTargets.length === 0) return null;
      // 先过滤出可创建战役的目标（限制性允许多方争城）
      const candidates = rawTargets.filter(targetId =>
        canCreateAnotherCampaignAgainstTarget(faction, targetId, options)
      );
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => {
        return npcTargetScore(faction, b) - npcTargetScore(faction, a);
      });
      const topTargets = candidates.slice(0, Math.min(3, candidates.length));
      for (const targetId of topTargets) {
        const sourceId = getNpcCampaignSource(faction, targetId);
        if (!sourceId) continue;
        const hostility = Math.max(Math.abs(getFactionHostility(faction, cityController(targetId))), npcTargetScore(faction, targetId));
        let troopsAmount, routeMode;
        if (hostility >= 30) {
          troopsAmount = 2000 + Math.floor(Math.random() * 1500);
          routeMode = 'official';
        } else if (hostility >= 15) {
          troopsAmount = 1200 + Math.floor(Math.random() * 800);
          routeMode = Math.random() < 0.6 ? 'official' : 'raid';
        } else {
          troopsAmount = 600 + Math.floor(Math.random() * 600);
          routeMode = Math.random() < 0.7 ? 'raid' : 'stealth';
        }
        const sourceCity = gameState.cities[sourceId];
        const actualTroops = Math.min(troopsAmount, Math.max(0, realTroops(sourceCity.garrison) - 350));
        if (actualTroops < 400) continue;
        return { faction, source: sourceId, target: targetId, troops: actualTroops, routeMode };
      }
      return null;
    }

    function runNpcWarAI(reports, options = {}) {
      enforceBenevolentDefensiveCampaignRules(reports);
      if (!options.force && gameState.turn < 3) return;
      // 不再用 jingnanOpening 直接 return 整个 NPC 战争系统。
      // 桂阳开局只限制 NPC 对玩家（已在 getNpcAttackTargets 中过滤），不限制 NPC 对 NPC。
      const npcFactions = Object.keys(FACTIONS).filter(f => f !== 'player');
      let campaignsCreated = 0;
      const shuffled = [...npcFactions].sort(() => Math.random() - 0.5);
      for (const faction of shuffled) {
        if (campaignsCreated >= MAX_NPC_CAMPAIGNS_PER_TURN) break;
        if (!shouldNpcLaunchCampaign(faction, reports)) continue;
        const plan = createNpcCampaignPlan(faction, options);
        if (!plan) continue;
        const campaign = createNpcCampaign(plan, reports);
        if (campaign) {
          campaign.routeMode = plan.routeMode;
          const isHiddenMode = plan.routeMode === 'raid' || plan.routeMode === 'night' || plan.routeMode === 'stealth';
          campaign.visibility = isHiddenMode ? 'hidden' : 'public';
          gameState.factionWarState.lastAttackTurnByFaction[faction] = gameState.turn;
          gameState.factionWarState.recentWars.push({
            attacker: faction,
            defender: cityController(plan.target),
            source: plan.source,
            target: plan.target,
            turn: gameState.turn,
            troops: plan.troops,
            routeMode: plan.routeMode
          });
          if (gameState.factionWarState.recentWars.length > 20) {
            gameState.factionWarState.recentWars.shift();
          }
          const defender = cityController(plan.target);
          if (defender !== 'local' && defender !== 'player') {
            const rels = gameState.factionRelations;
            if (!rels[faction]) rels[faction] = {};
            if (!rels[defender]) rels[defender] = {};
            rels[faction][defender] = (rels[faction][defender] || 0) - 15;
            rels[defender][faction] = (rels[defender][faction] || 0) - 15;
          }
          // 注意：reportNpcCampaignEvent 现在接收 campaign 对象，它在内部自动检测多方争城
          reportNpcCampaignEvent(campaign, 'march', reports);
          campaignsCreated++;
        }
      }
    }

    function reportNpcCampaignEvent(campaign, eventType, reports) {
      const factionStr = campaign.faction;
      const sourceId = campaign.source;
      const targetId = campaign.target;
      const routeMode = campaign.routeMode || 'official';
      const troops = realTroops(campaign.army);
      const factionNameStr = factionName(factionStr);
      const sourceName = regionName(sourceId);
      const targetName = regionName(targetId);
      const defenderFaction = cityController(targetId);
      const defenderName = factionName(defenderFaction);
      const hostility = Math.abs(getFactionHostility(factionStr, defenderFaction));

      // 检测多方争城
      const attackers = activeAttackersTargetingCity(targetId);
      const attackerCount = attackers.length;
      if (eventType === 'multiFactionContest' || (attackerCount >= 2 && eventType === 'march')) {
        if (attackerCount >= 3) {
          const attackerNames = attackers.map(f => factionName(f)).join('、');
          reports.push({ tone: 'bad', text: `【天下大乱】${targetName}已成群雄争夺之地，${attackerNames}三路兵马同时逼近。`, level: 'important' });
          return;
        }
        if (attackerCount === 2) {
          const attackerNames = attackers.map(f => factionName(f)).join('、');
          reports.push({ tone: 'bad', text: `【群雄争城】${targetName}局势骤紧，${attackerNames}两路兵马皆向此城进发。`, level: 'important' });
          return;
        }
      }

      let tone, text;
      if (hostility >= 30) {
        tone = 'bad';
        if (routeMode === 'official') {
          text = `【大战】${factionNameStr}军自${sourceName}大举进攻${defenderName}的${targetName}，战事一触即发。天下诸侯皆在关注此役。`;
        } else {
          const method = routeMode === 'raid' ? '劫掠' : '潜行';
          text = `【突袭】${factionNameStr}以${method}之策突袭${defenderName}的${targetName}，${targetName}守军猝不及防。`;
        }
      } else if (hostility >= 15) {
        tone = 'warn';
        if (routeMode === 'official') {
          text = `【交锋】${factionNameStr}出兵${targetName}，与${defenderName}在${sourceName}至${targetName}之间对峙。`;
        } else {
          text = `【扰边】${factionNameStr}以轻兵骚扰${defenderName}的${targetName}，边地人心惶惶。`;
        }
      } else {
        tone = 'warn';
        if (routeMode === 'stealth') {
          text = `【暗流】${targetName}附近有不明兵马调动，疑似${factionNameStr}斥候探路。`;
        } else {
          text = `【摩擦】${factionNameStr}与${defenderName}在${sourceName}至${targetName}间发生小规模冲突。`;
        }
      }
      reports.push({ tone, text, level: hostility >= 25 ? 'important' : 'minor' });
    }

    function validateNpcCampaignSystem() {
      const results = [];
      results.push({ check: '常量定义', pass: typeof DEFAULT_FACTION_RELATIONS === 'object', detail: 'DEFAULT_FACTION_RELATIONS: ' + Object.keys(DEFAULT_FACTION_RELATIONS).length + ' 势力' });
      results.push({ check: '速率限制', pass: MAX_NPC_CAMPAIGNS_PER_TURN > 0 && NPC_WAR_COOLDOWN_TURNS > 0, detail: '每回合最大 ' + MAX_NPC_CAMPAIGNS_PER_TURN + ' 场, 冷却 ≥ ' + NPC_WAR_COOLDOWN_TURNS + ' 回合' });
      results.push({ check: '多方争城常量', pass: MAX_ATTACKERS_PER_TARGET_CITY > 0 && MULTI_FACTION_TARGET_CHANCE > 0, detail: '每城最多 ' + MAX_ATTACKERS_PER_TARGET_CITY + ' 势力同时进攻, 多方概率基础 ' + MULTI_FACTION_TARGET_CHANCE });
      results.push({ check: 'factionWarState', pass: !!gameState.factionWarState, detail: 'lastAttackTurnByFaction 记录 ' + Object.keys(gameState.factionWarState.lastAttackTurnByFaction || {}).length + ' 条, recentWars ' + (gameState.factionWarState.recentWars || []).length + ' 条' });
      results.push({ check: 'factionRelations', pass: !!gameState.factionRelations, detail: '势力关系表已加载，' + Object.keys(gameState.factionRelations || {}).length + ' 个势力键' });
      const npcFactions = Object.keys(FACTIONS).filter(f => f !== 'player');
      let totalNpcCities = 0;
      for (const f of npcFactions) {
        const cities = getNpcControlledCities(f);
        totalNpcCities += cities.length;
        results.push({ check: factionName(f) + ' 控制城池', pass: cities.length >= 0, detail: cities.length + ' 座: ' + (cities.map(id => regionName(id)).join('、') || '无') });
      }
      results.push({ check: 'NPC势力城池总数', pass: totalNpcCities > 0, detail: totalNpcCities + ' 座' });
      for (const f of npcFactions) {
        const targets = getNpcAttackTargets(f);
        results.push({ check: factionName(f) + ' 可攻击目标', pass: targets.length >= 0, detail: targets.length + ' 个: ' + (targets.map(id => regionName(id) + '(' + factionName(cityController(id)) + ')').join('、') || '无') });
      }
      let relCount = 0;
      for (const f of npcFactions) {
        const rels = gameState.factionRelations[f] || {};
        relCount += Object.keys(rels).length;
      }
      results.push({ check: '势力关系条目数', pass: relCount > 0, detail: relCount + ' 条' });
      const activeCampaigns = gameState.campaigns.filter(isActiveCampaign);
      const visibleCampaigns = activeCampaigns.filter(c => isCampaignVisibleOnMap(c));
      results.push({ check: '进行中战役', pass: activeCampaigns.length >= 0, detail: activeCampaigns.length + ' 场 (' + visibleCampaigns.length + ' 对玩家可见)' });
      const npcActive = activeCampaigns.filter(c => c.faction !== 'player');
      const npcVisible = npcActive.filter(c => isCampaignVisibleOnMap(c));
      results.push({ check: 'NPC进行中战役', pass: npcActive.length >= 0, detail: npcActive.length + ' 场 (' + npcVisible.length + ' 对玩家可见, 上限 ' + MAX_VISIBLE_NPC_CAMPAIGN_ROUTES + ')' });

      // 多方争城检测
      const campaignsByTarget = {};
      activeCampaigns.forEach(c => {
        if (!c.target) return;
        campaignsByTarget[c.target] = campaignsByTarget[c.target] || [];
        campaignsByTarget[c.target].push(c);
      });
      const contestedTargets = Object.entries(campaignsByTarget)
        .filter(([targetId, campaigns]) => {
          const uniqueAttackers = [...new Set(campaigns.map(c => c.faction || c.actor || c.owner).filter(Boolean))];
          return uniqueAttackers.length >= 2;
        })
        .map(([targetId, campaigns]) => {
          const uniqueAttackers = [...new Set(campaigns.map(c => c.faction || c.actor || c.owner).filter(Boolean))];
          return {
            target: targetId,
            targetName: regionName(targetId),
            attackers: uniqueAttackers,
            attackerNames: uniqueAttackers.map(f => factionName(f)),
            attackerCount: uniqueAttackers.length,
            campaigns: campaigns.map(c => ({
              id: c.id, faction: c.faction || c.actor, source: c.source,
              routeMode: c.routeMode, visibility: c.visibility, status: c.status, phase: c.phase, eta: c.eta
            }))
          };
        });
      results.push({ check: '多方争城目标', pass: contestedTargets.length >= 0, detail: contestedTargets.length + ' 个城正被多方进攻' });
      if (contestedTargets.length > 0) {
        console.log('=== 多方争城详情 ===');
        console.table(contestedTargets.map(ct => ({
          目标城: ct.targetName,
          进攻方: ct.attackerNames.join('、'),
          势力数: ct.attackerCount,
          战役数: ct.campaigns.length
        })));
        results._contestedTargets = contestedTargets;
      }

      console.table(results.map(r => ({ 检查项: r.check, 通过: r.pass ? '✓' : '✗', 详情: r.detail })));
      return results;
    }

    function debugNpcWarState() {
      const npcFactions = Object.keys(FACTIONS).filter(f => f !== 'player');
      const result = {
        turn: gameState.turn,
        currentAct: gameState.currentAct,
        jingnanOpening: !!gameState.storyFlags?.jingnanOpening,
        blockedByTurn: gameState.turn < 3,
        blockedByOpening: gameState.currentAct === 1 && !!gameState.storyFlags?.jingnanOpening,
        campaigns: gameState.campaigns.filter(isActiveCampaign).map(c => ({
          id: c.id, faction: c.faction, source: c.source, target: c.target,
          routeMode: c.routeMode, visibility: c.visibility, status: c.status, phase: c.phase,
          visible: isCampaignVisibleOnMap(c)
        })),
        factions: npcFactions.map(f => ({
          faction: f,
          name: factionName(f),
          cities: getNpcControlledCities(f),
          targets: getNpcAttackTargets(f),
          lastAttackTurn: gameState.factionWarState?.lastAttackTurnByFaction?.[f] || 0
        }))
      };
      console.log(result);
      console.table(result.factions.map(f => ({
        势力: f.name,
        控城: f.cities.length,
        可攻目标: f.targets.length,
        上次出兵: f.lastAttackTurn
      })));
      console.table(result.campaigns);
      return result;
    }

    window.debugNpcWarState = debugNpcWarState;

    function forceNpcCampaign(faction, targetCityId, routeMode = 'official', sourceId = null, options = {}) {
      if (!FACTIONS[faction] || faction === 'player') return toast('无效的 NPC 势力: ' + faction);
      if (!gameState.cities[targetCityId] || isRemovedCityId(targetCityId)) return toast('无效的目标城池: ' + targetCityId);

      // 检查多方争城限制（除非 options 强制跳过）
      if (!options.forceOverrideLimit && !canCreateAnotherCampaignAgainstTarget(faction, targetCityId, options)) {
        const attackers = activeAttackersTargetingCity(targetCityId);
        if (attackers.includes(faction)) {
          return toast(factionName(faction) + '已有一路兵马在进攻' + regionName(targetCityId));
        }
        if (attackers.length >= MAX_ATTACKERS_PER_TARGET_CITY) {
          return toast(regionName(targetCityId) + '已被' + attackers.length + '个势力进攻，已达上限（' + MAX_ATTACKERS_PER_TARGET_CITY + '），可用 { forceOverrideLimit: true } 突破');
        }
        return toast(regionName(targetCityId) + '当前不可被' + factionName(faction) + '重复进攻');
      }

      const reports = [];
      const finalSourceId = sourceId || getNpcCampaignSource(faction, targetCityId);
      if (!finalSourceId) return toast(factionName(faction) + '没有可行的出兵城通往 ' + regionName(targetCityId));
      const sourceCity = gameState.cities[finalSourceId];
      const garrison = realTroops(sourceCity.garrison);
      const troops = Math.min(garrison - 300, 2000);
      if (troops < 400) return toast(factionName(faction) + '在' + regionName(finalSourceId) + '兵力不足（需至少 400，当前可用 ' + troops + '）');
      const plan = { faction, source: finalSourceId, target: targetCityId, troops, routeMode };
      const campaign = createNpcCampaign(plan, reports);
      if (campaign) {
        campaign.routeMode = routeMode;
        const isHiddenMode = routeMode === 'raid' || routeMode === 'night' || routeMode === 'stealth';
        campaign.visibility = isHiddenMode ? 'hidden' : 'public';
        gameState.factionWarState.lastAttackTurnByFaction[faction] = gameState.turn;
        gameState.factionWarState.recentWars.push({
          attacker: faction,
          defender: cityController(targetCityId),
          source: finalSourceId,
          target: targetCityId,
          turn: gameState.turn,
          troops,
          routeMode
        });
        if (gameState.factionWarState.recentWars.length > 20) {
          gameState.factionWarState.recentWars.shift();
        }
        reportNpcCampaignEvent(campaign, 'march', reports);
        reports.forEach(r => addNews(r.tone, r.text));
        toast(factionName(faction) + '已从' + regionName(finalSourceId) + '出兵攻击' + regionName(targetCityId) + '，兵力 ' + fmt(troops) + '，路线 ' + routeMode);
        console.table({
          faction,
          source: finalSourceId,
          target: targetCityId,
          routeMode,
          visibility: campaign.visibility,
          status: campaign.status,
          eta: campaign.eta
        });
        saveToStorage(false);
        render();
        return campaign;
      } else {
        return toast('创建战役失败：路线不通或参数无效');
      }
    }

    function renderCampaignRoutes() {
      const active = gameState.campaigns.filter(c => isActiveCampaign(c) && isCampaignVisibleOnMap(c));
      // 限制 NPC 可见路线数量，玩家战役不受限制
      const playerRoutes = active.filter(c => c.faction === 'player');
      let npcRoutes = active.filter(c => c.faction !== 'player');
      if (npcRoutes.length > MAX_VISIBLE_NPC_CAMPAIGN_ROUTES) {
        npcRoutes = npcRoutes.slice(0, MAX_VISIBLE_NPC_CAMPAIGN_ROUTES);
      }
      const visible = [...playerRoutes, ...npcRoutes];

      // 检测同一目标被多个势力进攻，用于添加偏移避免路线完全重叠
      const targetCampaignsMap = {};
      visible.forEach(c => {
        targetCampaignsMap[c.target] = targetCampaignsMap[c.target] || [];
        targetCampaignsMap[c.target].push(c);
      });

      return visible.map(campaign => {
        const hostile = campaign.faction !== 'player' ? ' hostile' : '';
        const sameTargetCampaigns = targetCampaignsMap[campaign.target] || [];
        const campaignIndex = sameTargetCampaigns.indexOf(campaign);
        const multiOffset = sameTargetCampaigns.length > 1 ? (campaignIndex - (sameTargetCampaigns.length - 1) / 2) * 8 : 0;

        return campaign.route.edges.map((edge, index) => {
          const curve = routeCurve(edge.from, edge.to, campaign.routeMode, false, multiOffset);
          const isLastEdge = index === campaign.route.edges.length - 1;
          // 最后一条边显示标签
          const labelYOffset = isLastEdge ? (-13 + multiOffset * 0.5) : 0;
          const label = isLastEdge ? `<text class="campaign-route-label" x="${curve.midX}" y="${curve.midY + labelYOffset}">${campaign.phase}｜ETA ${campaign.travelRemaining || 0}｜粮 ${campaign.supply}</text>` : '';
          return `<path class="campaign-route${hostile}" marker-end="url(#${campaign.faction === 'player' ? 'moveHead' : 'arrowHead'})" d="${curve.d}"></path>${label}`;
        }).join('');
      }).join('');
    }

    function renderFxLayer() {
      const layer = document.getElementById('fxLayer');
      if (!layer || !gameState) return;
      gameState.visualEffects = (gameState.visualEffects || []).filter(effect => effect.expiresAt > Date.now());
      layer.innerHTML = gameState.visualEffects.map(effect => {
        const center = getRegion(effect.cityId)?.center || gameState.cities[effect.cityId];
        if (!center) return '';
        if (effect.type === 'campaignFeedback') {
          const lines = (effect.lines || []).slice(0, 8).map((line, index) => `
            <text class="fx-delta-line" x="0" y="${-58 - index * 18}" style="animation-delay:${index * 70}ms">${escapeHtml(line)}</text>
          `).join('');
          return `<g class="campaign-fx-delta" transform="translate(${center.x} ${center.y})">${lines}</g>`;
        }
        const glyph = effect.type === 'capture' ? '易帜' : effect.type === 'lost' ? '失守' : '交战';
        return `<g class="city-fx-shake" transform="translate(${center.x} ${center.y})">
          <circle class="city-fx-ring" r="${effect.type === 'battle' ? 42 : 58}"></circle>
          <text class="fx-glyph" x="0" y="-52">${glyph}</text>
        </g>`;
      }).join('');
    }

    function snapshotPlayerState() {
      const totals = cityTotals();
      const cities = controlledCities();
      const average = key => cities.length ? cities.reduce((sum, city) => sum + Number(city[key] || 0), 0) / cities.length : 0;
      return { money: totals.money, food: totals.food, population: totals.population, troops: totals.troops, support: average('publicSupport'), order: average('order'), morale: average('morale'), protection: gameState.player.protection, campaigns: gameState.campaigns.filter(isActiveCampaign).length };
    }

    function buildPlayerDeltas(before, after) {
      const fields = [
        ['money', '府库', '🪙'], ['food', '粮食', '🌾'], ['population', '人口', '民'], ['troops', '兵力', '⚔'],
        ['support', '民心', '心'], ['order', '治安', '安'], ['morale', '士气', '旗'], ['protection', '刘表庇护', '护'], ['campaigns', '进行中军令', '令']
      ];
      return fields.map(([key, label, icon]) => ({ key, label, icon, value: Math.round((after[key] || 0) - (before[key] || 0)) })).filter(item => item.value !== 0);
    }

    function renderPlayerDeltaPanel(summary) {
      return summary.deltas.length ? summary.deltas.map((item, index) => `<div class="delta-item ${item.value >= 0 ? 'good' : 'bad'}" style="animation-delay:${index * 60}ms"><span>${item.icon} ${item.label}</span><strong>${item.value >= 0 ? '+' : ''}${fmt(item.value)}</strong></div>`).join('') : '<div class="turn-event-item">本回合我方主要状态稳定。</div>';
    }

    function animateDeltaItem(element, tone = 'good') {
      if (!element || gameState.settings?.reducedMotion) return;
      const direction = tone === 'bad' ? 8 : -8;
      element.animate?.(
        [
          { opacity: 0, transform: `translateY(${direction}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 360, easing: 'ease-out', fill: 'both' }
      );
    }

    function playDeltaSfx(type) {
      playSfx(type === 'good' ? 'delta_good' : 'delta_bad');
    }

    function renderTurnResultModal(summary) {
      const events = summary.events.filter(event => event.level !== 'minor');
      gameState.aiContentPayloads ||= {};
      return `<div class="game-modal">
        <div class="modal-head"><div><h2>第 ${summary.turn} 回合结算</h2><span class="tag">${summary.date}</span></div><button data-turn-summary-continue="1">继续</button></div>
        <div class="modal-columns">
          <section class="modal-column"><h3>我方状态变化</h3>${renderPlayerDeltaPanel(summary)}</section>
          <section class="modal-column"><h3>当日战报 / 天下消息 / 来信</h3>
            ${events.length ? events.map(event => {
              let aiButton = '';
              if (event.level === 'important' && !event.letterId) {
                const payloadId = 'event_' + gameState.turn + '_' + simpleHash((event.id || '') + (event.text || ''));
                gameState.aiContentPayloads[payloadId] ||= {
                  id: event.id || '',
                  eventId: event.id || '',
                  title: '战报详情',
                  summary: event.text || '',
                  tone: event.tone || '',
                  level: event.level || '',
                  turn: gameState.turn
                };
                aiButton = `<div><button class="ghost-btn" data-ai-content-type="battleReportDetail" data-ai-content-payload-id="${payloadId}">AI 详析</button></div>`;
              }
              return `<div class="turn-event-item ${event.level}">
                <strong>${escapeHtml(event.text)}</strong>
                ${event.letterId ? `<div><button data-open-letter="${event.letterId}">打开来信</button></div>` : ''}
                ${event.level === 'important' && !event.letterId ? `<div><button data-open-turn-event="${event.id}">展开详情</button></div>` : ''}
                ${aiButton}
              </div>`;
            }).join('') : '<div class="turn-event-item">本回合没有需要特别禀报的大事。</div>'}
          </section>
        </div>
      </div>`;
    }

    function openNextCriticalModal() {
      if (checkDefeatEnding()) return;
      if (gameState.activeModal) return renderModal();
      const urgent = gameState.urgentMatters.find(item => !item.resolved && !item.deferred);
      if (urgent) gameState.activeModal = { type: 'urgent', matterId: urgent.id };
      else {
        const special = gameState.specialEventState.queue.find(event => event.level === 'critical' && event.blueprintId !== 'liubiao_letter');
        const letter = gameState.letters.find(item => item.critical && !item.read && !item.resolved);
        if (special) gameState.activeModal = { type: 'special', eventId: special.id };
        else if (letter) gameState.activeModal = { type: 'letter', letterId: letter.id };
        else if (gameState.pendingTurnSummary) gameState.activeModal = { type: 'turnSummary' };
      }
      renderModal();
    }

    function closeActiveModal() {
      if (isForcedGuideDialogueThinking()) {
        toast('请等待对方回应。');
        return;
      }
      hideLetterCinematicOverlay();
      resumeBgm(); // 关闭弹窗时恢复背景音乐（如信件动画正在播放）
      if (gameState.activeModal?.type === 'urgent') {
        const matter = gameState.urgentMatters.find(item => item.id === gameState.activeModal.matterId);
        if (matter) matter.deferred = true;
      }
      // If guide is active and we're closing an eventDetail modal, advance guide step
      const wasGuideModal = isGuideActive() && gameState.activeModal?.type === 'eventDetail';
      // 第3回合：对话弹窗关闭后，自动高亮结束回合按钮
      const wasDialogueInPhase3 = isGuideActive() && gameState.activeModal?.type === 'dialogue' && gameState.tutorial.guidePhase === 3 && getGuideStepIndex(3) === 4;
      // 引导结束后，首次与刘表会话时弹出密令入匣信件
      if (!isGuideActive() && gameState.tutorial?.guideCompleted && gameState.activeModal?.type === 'dialogue' && gameState.activeModal?.characterId === 'liuBiao') {
        const plotLetter = gameState.letters.find(item => item.meta?.nodeId === 'lb_1_1' && !item.resolved);
        if (plotLetter) plotLetter.read = false;
      }
      gameState.activeModal = null;
      openNextCriticalModal();
      render();
      if (wasGuideModal) {
        advanceGuideStep();
      }
      if (wasDialogueInPhase3) {
        setTimeout(() => {
          clearGuideHighlights();
          setForceAction('endTurn', 'endTurn');
          highlightGuideElement('[data-end-turn="1"]', '请点击结束回合，完成本回合', 'left');
        }, 200);
      }
    }

    function continueTurnSummary() {
      gameState.pendingTurnSummary = null;
      gameState.activeModal = null;
      saveToStorage(false);
      openNextCriticalModal();
      render();
    }

    function isForcedGuideDialogueThinking() {
      return isGuideActive()
        && gameState.activeModal?.type === 'dialogue'
        && gameState.activeModal.loading === true
        && Boolean(gameState.tutorial?.forceAction);
    }

    function canUseAiContentApi() {
      gameState.aiUsage ||= {};
      gameState.aiUsage.turn ||= gameState.turn;
      gameState.aiUsage.turnDialogueCalls ||= 0;
      gameState.aiUsage.maxDialogueCallsPerTurn ||= 5;
      gameState.aiUsage.turnContentCalls ||= 0;
      gameState.aiUsage.maxContentCallsPerTurn ||= 6;

      if (gameState.aiUsage.turn !== gameState.turn) {
        gameState.aiUsage.turn = gameState.turn;
        gameState.aiUsage.turnDialogueCalls = 0;
        gameState.aiUsage.turnContentCalls = 0;
      }

      const max = Number(gameState.aiUsage.maxContentCallsPerTurn || 6);
      if (gameState.aiUsage.turnContentCalls >= max) return false;
      gameState.aiUsage.turnContentCalls += 1;
      return true;
    }

    function buildAiContentKey(type, payload = {}) {
      const raw = JSON.stringify({
        type,
        turn: gameState.turn,
        id: payload.id || '',
        eventId: payload.eventId || '',
        characterId: payload.characterId || '',
        cityId: payload.cityId || '',
        factionId: payload.factionId || '',
        topic: payload.topic || '',
        summary: payload.summary || ''
      });
      return type + '|' + gameState.turn + '|' + simpleHash(raw);
    }

    function buildCompactAiContentContext(type, payload = {}) {
      return {
        type,
        turn: gameState.turn,
        date: formatDate(),
        player: {
          name: gameState.player?.name,
          title: gameState.player?.title,
          protection: gameState.player?.protection,
          independent: !!gameState.player?.independent,
          cityCount: controlledCities().length,
          mainCities: controlledCities().slice(0, 4).map(city => ({
            id: city.id,
            name: city.name,
            publicSupport: city.publicSupport,
            food: city.food,
            money: city.money,
            defense: city.defense,
            morale: city.morale
          }))
        },
        payload,
        recentEvents: (gameState.turnEvents || []).slice(-5).map(event => ({
          tone: event.tone,
          level: event.level,
          text: event.text
        })),
        recentSummaries: (gameState.turnSummaries || []).slice(0, 2).map(summary => ({
          turn: summary.turn,
          date: summary.date,
          events: (summary.events || []).slice(0, 4).map(event => event.text)
        }))
      };
    }

    function generateAiContentFallback(type, context) {
      const payload = context.payload || {};
      if (type === 'advisorAdvice') {
        return [
          '臣以为，当前局势不可只看一城一地。',
          payload.cityName ? payload.cityName + '之事，关乎民心、粮草与守备三端。' : '',
          '若府库尚足，可先稳民心；若敌军逼近，则应先整军修防。',
          '主公宜择其急者而行，不可使内政与军务同时失衡。'
        ].filter(Boolean).join('');
      }
      if (type === 'npcMessage') {
        return [
          payload.npcName ? payload.npcName + '遣人传话：' : '有人传话：',
          payload.summary || '局势有变，还请主公早作决断。'
        ].join('');
      }
      if (type === 'letterBody') {
        return [
          payload.senderName ? payload.senderName + '来信：' : '来信：',
          payload.summary || '近来局势多变，愿与主公再议后事。'
        ].join('');
      }
      if (type === 'battleReportDetail') {
        return [
          '此役虽只见战报数行，实则牵动军心与地势。',
          payload.summary || '',
          '若继续进兵，需留意粮道与后方守备。'
        ].filter(Boolean).join('');
      }
      return payload.summary || '局势未明，仍需主公亲自权衡。';
    }

    async function generateAiContent(type, payload) {
      gameState.aiContentCache ||= {};
      gameState.aiContentPending ||= {};
      const key = buildAiContentKey(type, payload);
      const cached = gameState.aiContentCache[key];
      if (cached?.text) return cached.text;
      if (gameState.aiContentPending[key]) return gameState.aiContentPending[key];

      const context = buildCompactAiContentContext(type, payload);
      const task = (async () => {
        let text = '';
        let usedApi = false;
        try {
          if (canUseAiContentApi() && window.remoteLLMAdapter?.generateAiContent) {
            text = await window.remoteLLMAdapter.generateAiContent(context);
            usedApi = true;
          } else {
            text = generateAiContentFallback(type, context);
          }
        } catch (error) {
          console.error('AI 内容生成失败，使用 fallback', type, error);
          text = generateAiContentFallback(type, context);
        }

        text = String(text || '').trim() || generateAiContentFallback(type, context);
        gameState.aiContentCache[key] = {
          key,
          type,
          turn: gameState.turn,
          title: payload.title || '',
          text,
          source: usedApi ? 'api' : 'fallback',
          createdAt: Date.now()
        };
        saveToStorage(false);
        return text;
      })();

      gameState.aiContentPending[key] = task;
      try {
        return await task;
      } finally {
        delete gameState.aiContentPending[key];
      }
    }

    function openAiContentModal(type, payload, options = {}) {
      const title = payload.title || '详情';
      gameState.activeModal = {
        type: 'aiContent',
        contentType: type,
        payload,
        title,
        loading: true,
        text: '',
        sourceLetterId: options.letterId || payload.letterId || null,
        returnModal: options.returnModal || null
      };
      renderModal();
      generateAiContent(type, payload).then(text => {
        if (gameState.activeModal?.type === 'aiContent' && gameState.activeModal.contentType === type) {
          gameState.activeModal.loading = false;
          gameState.activeModal.text = text;
          const key = buildAiContentKey(type, payload);
          gameState.activeModal.source = gameState.aiContentCache[key]?.source || 'fallback';
          renderModal();
        }
      }).catch(error => {
        console.error('AI 内容弹窗生成失败', error);
        if (gameState.activeModal?.type === 'aiContent') {
          gameState.activeModal.loading = false;
          gameState.activeModal.text = generateAiContentFallback(type, buildCompactAiContentContext(type, payload));
          gameState.activeModal.source = 'fallback';
          renderModal();
        }
      });
    }

    function normalizeAiContentCache() {
      gameState.aiContentCache ||= {};
      gameState.aiContentPayloads ||= {};
      Object.keys(gameState.aiContentCache).forEach(key => {
        const item = gameState.aiContentCache[key];
        if (!item || gameState.turn - Number(item.turn || 0) > 3) delete gameState.aiContentCache[key];
      });
      Object.keys(gameState.aiContentPayloads).forEach(id => {
        const payload = gameState.aiContentPayloads[id];
        if (payload && payload.turn != null && gameState.turn - payload.turn > 3) delete gameState.aiContentPayloads[id];
      });
    }

    function getLetterBackdropClass(letter) {
      const sourceText = [
        letter?.senderId,
        letter?.senderName,
        letter?.senderFaction,
        letter?.title,
        letter?.body,
        letter?.kind
      ].join(' ');
      if (letter?.senderId === 'liuBiao' || letter?.critical) return 'letter-bg-arrival';
      if (/军|兵|战|营|攻|守|粮道|断粮|刺探|谋略|内应|伏|援|防务/.test(sourceText)) return 'letter-bg-war';
      return 'letter-bg-study';
    }

    function renderLetterChoiceButtons(letter) {
      if (!letter || letter.resolved) return '';
      return (letter.choices || [])
        .map(choice => `<button data-letter-choice="${choice.id}" data-letter="${letter.id}">${escapeHtml(choice.label)}</button>`)
        .join('');
    }

    function renderAiContentLetterChoices(modal) {
      if (modal.contentType !== 'letterBody') return '';
      const letterId = modal.sourceLetterId || modal.payload?.letterId || modal.returnModal?.letterId;
      const letter = gameState.letters.find(item => item.id === letterId);
      if (!letter) return '';
      const choiceButtons = renderLetterChoiceButtons(letter);
      if (!choiceButtons && !letter.resolved) return '';
      return [
        '<div class="ai-content-letter-actions">',
        '<h3>回信选项</h3>',
        '<div class="modal-actions">',
        letter.resolved ? '<button data-close-modal="1">收起书信</button>' : choiceButtons,
        '</div>',
        '</div>'
      ].join('');
    }

    function renderModal() {
      const root = document.getElementById('gameModalRoot');
      if (!root) return;
      const modal = gameState.activeModal;
      const cinematicLetter = modal?.type === 'letter'
        ? gameState.letters.find(item => item.id === modal.letterId)
        : null;
      const shouldShowLetterCinematic = !!(cinematicLetter?.meta?.cinematic?.src && !cinematicLetter.meta.cinematicWatched);
      if (!shouldShowLetterCinematic) hideLetterCinematicOverlay();
      root.classList.toggle('show', Boolean(modal));
      root.classList.toggle('letter-open', modal?.type === 'letter');
      if (!modal) {
        root.innerHTML = '';
        return;
      }
      if (modal.type === 'turnSummary') {
        root.innerHTML = renderTurnResultModal(gameState.pendingTurnSummary);
        root.querySelectorAll?.('.delta-item').forEach((item, index) => {
          setTimeout(() => animateDeltaItem(item, item.classList.contains('bad') ? 'bad' : 'good'), index * 60);
        });
        return;
      }
      if (modal.type === 'portraitView') {
        root.innerHTML = renderPortraitViewModal(gameState.characterRoster?.[modal.characterId]);
        return;
      }
      if (modal.type === 'dialogue') {
        const npc = gameState.characterRoster[modal.characterId];
        const closeButton = isForcedGuideDialogueThinking() ? '' : '<button class="ghost-btn" data-close-modal="1">关闭</button>';
        root.innerHTML = `<div class="game-modal">
          <div class="modal-head"><h2>${npc.name}｜${CONVERSATION_ACTIONS[modal.conversationType]?.label || '会谈'}</h2>${closeButton}</div>
          <div class="dialogue-layout"><div class="dialogue-portrait">${escapeHtml(npc.portraitPlaceholder)}</div>
          <div><div class="dialogue-text">${modal.loading ? '对方沉思片刻……' : escapeHtml(modal.dialogue.npcText)}</div>
          ${modal.loading ? '' : `<div class="tag-row"><span class="tag">${modal.dialogue.emotionalShift}</span><span class="tag">信任 ${fmt(npc.trustPlayer)}</span><span class="tag">怀疑 ${fmt(npc.suspicionOfPlayer)}</span></div>`}</div></div>
        </div>`;
        return;
      }
      if (modal.type === 'lordSolicitation') {
        root.innerHTML = renderLordSolicitationModal(modal);
        return;
      }
      if (modal.type === 'letter') {
        const letter = cinematicLetter || gameState.letters.find(item => item.id === modal.letterId);
        if (!letter) return closeActiveModal();
        letter.read = true;
        if (shouldShowLetterCinematic) {
          root.classList.remove('show', 'letter-open');
          root.innerHTML = '';
          showLetterCinematicOverlay(letter);
          return;
        }
        const letterPayloadId = 'letter_' + letter.id + '_' + gameState.turn;
        gameState.aiContentPayloads ||= {};
        gameState.aiContentPayloads[letterPayloadId] ||= {
          id: 'letter_' + letter.id,
          letterId: letter.id,
          characterId: letter.fromCharacterId || letter.senderId || '',
          senderName: letter.senderName || '',
          title: letter.title || '',
          summary: letter.summary || letter.body || '',
          choices: (letter.choices || []).map(choice => choice.label),
          turn: gameState.turn
        };
        let letterGuideHint = '';
        if (isGuideActive() && letter.choices && letter.choices.length > 0) {
          letterGuideHint = '<div class="guide-options-list" style="margin-top:12px;">';
          letter.choices.forEach(choice => {
            letterGuideHint += '<div class="guide-option-card"><div class="option-name">' + escapeHtml(choice.label) + '</div>';
            if (choice.guideHint) {
              letterGuideHint += '<span class="pros">' + escapeHtml(choice.guideHint.pros || '') + '</span>';
              letterGuideHint += '<span class="cons">' + escapeHtml(choice.guideHint.cons || '') + '</span>';
            } else {
              letterGuideHint += '<span class="pros">选择此项可能带来不同的后果</span>';
            }
            letterGuideHint += '</div>';
          });
          letterGuideHint += '</div>';
        }
        root.innerHTML = `<div class="game-modal letter-modal ${getLetterBackdropClass(letter)}">
          <div class="letter-head"><div><h2>${escapeHtml(letter.title)}</h2><span class="tag">${escapeHtml(letter.senderName)}｜${escapeHtml(letter.date)}</span></div></div>
          <div class="letter-body">${escapeHtml(letter.body)}</div>
          ${letterGuideHint}
          <div class="modal-actions">
            <button class="ghost-btn" data-ai-content-type="letterBody" data-ai-content-payload-id="${letterPayloadId}" data-letter="${letter.id}">展开信件原文</button>
            ${letter.resolved ? '<button data-close-modal="1">收起书信</button>' : renderLetterChoiceButtons(letter)}
          </div>
        </div>`;
        return;
      }
      if (modal.type === 'eventDetail' || modal.type === 'eventResult') {
        root.innerHTML = `<div class="game-modal">
          <div class="modal-head"><h2>${escapeHtml(modal.title)}</h2><button class="ghost-btn" data-close-modal="1">收起</button></div>
          <div class="dialogue-text">${escapeHtml(modal.text)}</div>
        </div>`;
        return;
      }
      if (modal.type === 'guideComplete') {
        root.innerHTML = `<div class="game-modal guide-complete-modal">
          <div class="modal-head"><h2>${escapeHtml(modal.title)}</h2><button class="ghost-btn" data-close-modal="1">开始</button></div>
          <div class="guide-complete-text">${escapeHtml(modal.text)}</div>
        </div>`;
        return;
      }
      if (modal.type === 'aiContent') {
        root.innerHTML = renderAiContentModal(modal);
        return;
      }
      if (modal.type === 'trainingChoice') {
        root.innerHTML = renderTrainingChoiceModal(modal);
        return;
      }
      if (modal.type === 'urgent') {
        const matter = gameState.urgentMatters.find(item => item.id === modal.matterId);
        if (!matter) return closeActiveModal();
        if (matter.type === 'plague') {
          const city = gameState.cities[matter.cityId];
          const healerCount = playerHealers().length;
          root.innerHTML = `<div class="game-modal">
          <div class="modal-head"><h2>${escapeHtml(matter.title)}</h2><span class="tag">剧情灾变</span></div>
          <p>${escapeHtml(matter.text)}</p>
          <div class="tag-row">
            <span class="tag">疫病：${city ? cityPlagueLevel(city.id) : matter.severity} / 100</span>
            <span class="tag">医者：${healerCount ? healerCount + ' 人在麾下' : '暂无专职医者'}</span>
          </div>
          <div class="modal-actions">
            <button data-urgent-choice="quarantine" data-matter="${matter.id}">封坊止疫</button>
            <button data-urgent-choice="granary" data-matter="${matter.id}">开仓施药</button>
            <button data-urgent-choice="healer" data-matter="${matter.id}">征调医者</button>
            <button data-urgent-choice="liubiao" data-matter="${matter.id}">求援刘表</button>
            <button data-urgent-choice="military" data-matter="${matter.id}">军中隔离</button>
            <button data-urgent-choice="conceal" data-matter="${matter.id}">隐瞒疫情</button>
            <button class="ghost-btn" data-urgent-choice="later" data-matter="${matter.id}">稍后处理</button>
          </div>
        </div>`;
          return;
        }
        root.innerHTML = `<div class="game-modal">
          <div class="modal-head"><h2>${escapeHtml(matter.title)}</h2><span class="tag">紧急战事</span></div>
          <p>${escapeHtml(matter.text)}</p>
          <div class="modal-actions">
            <button data-urgent-choice="hold" data-matter="${matter.id}">命守军固守</button>
            <button data-urgent-choice="relief" data-matter="${matter.id}">立即调兵增援</button>
            <button data-urgent-choice="support" data-matter="${matter.id}">请求刘表支援</button>
            <button data-urgent-choice="supply" data-matter="${matter.id}">派奇兵截粮</button>
            <button class="ghost-btn" data-urgent-choice="later" data-matter="${matter.id}">稍后处理</button>
          </div>
        </div>`;
        return;
      }
      if (modal.type === 'special') {
        const event = gameState.specialEventState.queue.find(item => item.id === modal.eventId);
        if (!event) return closeActiveModal();
        const npc = gameState.characterRoster[event.participant];
        const choices = event.choices || [
          { id: 'steady', label: '稳妥应对' },
          { id: 'press', label: '展示威势' },
          { id: 'ambition', label: '直陈志向' }
        ];
        root.innerHTML = `<div class="game-modal">
          <div class="modal-head"><h2>${escapeHtml(event.title)}</h2><span class="tag">人物事件</span></div>
          <div class="dialogue-layout"><div class="dialogue-portrait">${escapeHtml(npc?.portraitPlaceholder || '事')}</div><div class="dialogue-text">${escapeHtml(event.description)}</div></div>
          <div class="modal-actions">
            ${choices.map(choice => `<button data-special-choice="${choice.id}" data-special="${event.id}">${escapeHtml(choice.label)}</button>`).join('')}
          </div>
        </div>`;
        return;
      }
      if (modal.type === 'aiContent') {
        root.innerHTML = renderAiContentModal(modal);
        return;
      }
      if (modal.type === 'tutorialGuide') {
        root.innerHTML = renderGuideModal(modal.guideId);
        return;
      }
      if (modal.type === 'taskDrawer') {
        root.innerHTML = renderTaskDrawer();
        return;
      }
      if (modal.type === 'tutorialStartChoice') {
        root.innerHTML = `<div class="tutorial-guide-modal">
          <div class="guide-header"><h2>是否开启新手引导？</h2></div>
          <div class="guide-body">
            <p>新手引导将带领你逐步了解游戏的核心玩法，共5个回合。</p>
            <p>引导期间你将学习：城政、军事、刘表庇护、亲信系统、调兵、外交和谋略。</p>
          </div>
          <div class="guide-footer">
            <button data-start-force-guide="1">开始引导</button>
            <button class="btn-skip" data-skip-force-guide="1">跳过引导</button>
          </div>
        </div>`;
        return;
      }
      if (modal.type === 'appointmentPicker') {
        root.innerHTML = renderAppointmentPickerModal(modal);
        return;
      }
    }

    function renderLordSolicitationModal(modal) {
      const npc = gameState.characterRoster?.[modal.characterId];
      if (!npc) return '';
      const dialogue = modal.dialogue || {};
      const choices = [
        { id: 'promiseAutonomy', label: '承诺保留旧部与名分' },
        { id: 'demandSubmission', label: '要求其承认你的盟主地位' },
        { id: 'offerProtection', label: '许诺保护其宗族与百姓' }
      ];
      return `<div class="game-modal lord-solicitation-modal">
        <div class="modal-head"><h2>${escapeHtml(npc.name)}｜主公招揽</h2><button class="ghost-btn" data-close-modal="1">关闭</button></div>
        <div class="dialogue-layout">
          <div class="dialogue-portrait">${escapeHtml(npc.portraitPlaceholder)}</div>
          <div>
            <div class="dialogue-text">${modal.loading ? '对方正在权衡旧部、名分与大势……' : escapeHtml(dialogue.npcText || '')}</div>
            <div class="tag-row"><span class="tag">${escapeHtml(npc.lordTitle || npc.title || npc.role)}</span><span class="tag">这不是普通招募</span><span class="tag">归附谈判</span></div>
          </div>
        </div>
        <div class="modal-actions">
          ${modal.loading ? '' : choices.map(choice => `<button data-lord-solicitation-choice="${choice.id}">${escapeHtml(choice.label)}</button>`).join('')}
        </div>
      </div>`;
    }

    function renderTrainingChoiceModal(modal) {
      const city = gameState.cities?.[modal.cityId];
      if (!city || !isControlledBy(city.id, 'player')) {
        setTimeout(closeActiveModal, 0);
        return '';
      }
      const options = ['trainLand', 'trainCavalry', 'trainNavy']
        .map(action => {
          const plan = getSpecializedTrainingPlan(city, action);
          if (!plan) return '';
          const extraArchers = action === 'trainLand' ? Math.round(plan.amount * 0.28) : 0;
          const detail = [
            `<strong>${escapeHtml(plan.label)}</strong>`,
            `<span style="color:var(--good)">本次预计训练：${escapeHtml(plan.troopLabel)} ${fmt(plan.amount)}${extraArchers ? '、弓手 ' + fmt(extraArchers) : ''}</span>`,
            `消耗粮 ${fmt(plan.foodCost)}｜府库 ${fmt(plan.moneyCost)}｜士气 +${fmt(plan.moraleGain)}`,
            '城池特产已计入本次数量'
          ].join('<br>');
          const help = detail.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          return `
            <button class="training-choice-btn" data-training-choice="${action}" data-training-city="${city.id}" data-help="${help}">
              <strong>${escapeHtml(plan.label.replace('练', ''))}</strong>
              <span>悬停查看</span>
            </button>
          `;
        })
        .join('');
      return `
        <div class="game-modal training-choice-modal">
          <div class="modal-head">
            <div>
              <h2>${escapeHtml(city.name)}｜练兵</h2>
              <span class="tag">消耗 1 政务点</span>
            </div>
            <button class="ghost-btn" data-close-modal="1">关闭</button>
          </div>
          <p class="muted">选择本回合要训练的兵种。悬停兵种可查看本次训练数量、消耗与城池特产修正。</p>
          <div class="training-choice-grid">${options}</div>
        </div>
      `;
    }

    function renderAppointmentPickerModal(modal) {
      const role = modal.role;
      const city = gameState.cities?.[modal.cityId];
      const campaign = gameState.campaigns?.find(c => c.id === modal.campaignId);

      const title = campaign
        ? '任命战役主将'
        : '任命' + appointmentRoleLabel(role);

      const candidates = (modal.candidates || [])
        .map(id => gameState.characterRoster?.[id])
        .filter(Boolean);

      return `
        <div class="game-modal">
          <div class="modal-head">
            <h2>${escapeHtml(title)}</h2>
            <button class="ghost-btn" data-close-modal="1">关闭</button>
          </div>

          <div class="card">
            <p class="muted">
              ${campaign
                ? '请选择一名已招募且未任命的武将或谋士作为战役主将。'
                : '请选择一名已招募且未任命的人物担任 ' + escapeHtml(city?.name || '') + ' 的 ' + escapeHtml(appointmentRoleLabel(role)) + '。'}
            </p>

            ${
              candidates.length
                ? candidates.map(c => renderAppointmentCandidate(c, modal)).join('')
                : '<p class="muted">暂无符合条件且未任命的人物。</p>'
            }
          </div>

          <div class="modal-actions">
            <button data-close-modal="1">取消</button>
          </div>
        </div>
      `;
    }

    function renderAppointmentCandidate(character, modal) {
      const stats = character.stats || {};
      const mainStats = [
        '统率 ' + Math.round(stats.command || 0),
        '谋略 ' + Math.round(stats.strategy || 0),
        '政务 ' + Math.round(stats.politics || 0),
        '魅力 ' + Math.round(stats.charm || 0)
      ].join('｜');

      const actionAttrs = modal.campaignId
        ? `data-appoint-campaign-commander-from-picker="${modal.campaignId}" data-character-id="${character.id}"`
        : `data-appoint-city-from-picker="${modal.cityId}" data-appointment-role="${modal.role}" data-character-id="${character.id}"`;

      return `
        <div class="appointment-candidate">
          <div>
            <strong>${escapeHtml(character.name)}</strong>
            <span class="muted">${escapeHtml(character.type || '')}｜${escapeHtml(character.role || '')}</span>
            <p class="muted">${escapeHtml(mainStats)}</p>
          </div>
          <button ${actionAttrs}>任命</button>
        </div>
      `;
    }

    function renderAiContentModal(modal) {
      const sourceLabel = !modal.loading && modal.source === 'fallback'
        ? '<span class="tag muted">本地简版</span>'
        : (!modal.loading && modal.source === 'api' ? '<span class="tag">AI 生成</span>' : '');
      const letterChoices = renderAiContentLetterChoices(modal);
      const closeActions = modal.contentType === 'letterBody'
        ? ''
        : '<div class="modal-actions"><button data-close-modal="1">确认</button></div>';
      return [
        '<div class="game-modal ai-content-modal">',
        '<div class="modal-head">',
        '<h2>' + escapeHtml(modal.title || '详情') + '</h2>',
        sourceLabel,
        '<button class="ghost-btn" data-close-modal="1">关闭</button>',
        '</div>',
        '<div class="card ai-content-card">',
        modal.loading
          ? '<p class="ai-content-loading">谋士正在整理言辞……</p>'
          : '<p class="dialogue-text ai-content-text">' + escapeHtml(modal.text || '暂无内容。') + '</p>',
        '</div>',
        letterChoices,
        closeActions,
        '</div>'
      ].join('');
    }

    function captureRegion(regionId, controller, reports, options = {}) {
      const region = getRegion(regionId);
      if (!region || !hasMarkedPolygon(region)) {
        console.warn('Region not found or not marked:', regionId);
        return false;
      }
      const city = gameState.cities[regionId];
      const oldController = region.controller;
      region.controller = controller;
      if (gameState.player.independent) {
        region.nominalOwner = controller;
      }
      if (city) {
        city.actual = controller;
        city.owner = region.nominalOwner;
        city.controller = controller;
        city.nominalOwner = region.nominalOwner;
        city.faction = controller;
        city.isActive = true;
        if (controller === 'player') city.front = true;
      } else {
        region.nominalOwner = gameState.player.independent ? controller : region.nominalOwner;
      }
      if (controller === 'player' && oldController !== 'player') {
        gameState.player.prestige = clamp(gameState.player.prestige + (options.prestige || 5), 0, 100);
        if (region.nominalOwner === 'liubiao' && regionId !== gameState.player.startingCity && !options.skipProtectionDecay) {
          applyProtectionDecay(18, '你私自接管刘表名义属地 ' + region.name, reports);
        }
        if (region.nominalOwner === 'yuan' && !gameState.player.independent) {
          gameState.characters.yuanShao.alert = clamp(gameState.characters.yuanShao.alert + (options.alert || 10), 0, 100);
        }
      }
      if (options.select !== false) gameState.selectedCityId = regionId;
      syncMapDataFromGameState();
      if (oldController !== controller) playCityCapturedEffect(regionId, oldController, controller);
      const defeatedAfterCapture = checkDefeatEnding();
      if (reports) {
        const nominalText = region.nominalOwner === 'player'
          ? '归属势力：' + gameState.player.name
          : '名义归属：' + factionName(region.nominalOwner) + '；实际控制：' + gameState.player.name;
        reports.push({
          tone: controller === 'player' ? 'good' : 'warn',
          text: region.name + '已由' + (FACTIONS[controller]?.name || controller) + '实际控制。' + (controller === 'player' ? nominalText : '')
        });
      }
      if (defeatedAfterCapture && options.render !== false) {
        render();
      } else if (arguments.length <= 2 || options.render === true) {
        render();
        addNews(controller === 'player' ? 'good' : 'warn', `${region.name} 已由 ${FACTIONS[controller]?.name || controller} 实际控制`);
        toast(region.name + '控制权已更新');
      }
      return true;
    }

    if (typeof window !== 'undefined') {
      window.captureRegion = captureRegion;
      window.getMapData = () => mapData;
      window.getGameState = () => gameState;
      window.validateCityData = validateCityData;
      window.mergeMapRegionsWithCityData = mergeMapRegionsWithCityData;
      window.protectionModifier = protectionModifier;
      window.applyProtectionDecay = applyProtectionDecay;
      window.generateNpcDialogue = generateNpcDialogue;
      window.applyConversationResult = applyConversationResult;
      window.createMilitaryOrder = createMilitaryOrder;
      window.createNpcCampaign = createNpcCampaign;
      window.advanceCampaigns = advanceCampaigns;
      window.findCampaignRoute = findCampaignRoute;
      window.requestRelief = requestRelief;
      window.retreatCampaign = retreatCampaign;
      window.playMarchEffect = playMarchEffect;
      window.playBattleEffect = playBattleEffect;
      window.playCityCapturedEffect = playCityCapturedEffect;
      window.playCityLostEffect = playCityLostEffect;
      window.createLetter = createLetter;
      window.runNpcWarAI = runNpcWarAI;
      window.validateNpcCampaignSystem = validateNpcCampaignSystem;
      window.forceNpcCampaign = forceNpcCampaign;
      window.reloadMapEditorRegions = () => {
        manualMapRegions = null;
        mapData = createMapData();
        syncMapDataFromGameState();
        render();
        validateCityData();
        return mapData;
      };
    }

    function formatDate() {
      const d = gameState.date;
      return '公元' + d.year + '年' + d.month + '月' + d.day + '日';
    }

    function controlledCities() {
      return Object.values(gameState.cities).filter(city => !isRemovedCityId(city.id) && isActiveMapCity(city.id) && isControlledBy(city.id, 'player'));
    }

    function isDefeatEndingActive() {
      return Boolean(gameState.storyFlags?.defeatEnding?.active);
    }

    function canTriggerDefeatEnding() {
      return launchScreen === 'game' || Boolean(gameState.storyFlags?.characterCreated);
    }

    function renderDefeatEnding() {
      const root = document.getElementById('defeatEndingRoot');
      if (!root) return;
      root.classList.toggle('show', isDefeatEndingActive());
    }

    function triggerDefeatEnding(reason = 'allCitiesLost') {
      if (!canTriggerDefeatEnding()) return false;
      if (isDefeatEndingActive()) {
        renderDefeatEnding();
        return true;
      }
      gameState.storyFlags ||= {};
      gameState.storyFlags.defeatEnding = {
        active: true,
        reason,
        turn: gameState.turn,
        date: formatDate()
      };
      gameState.activeModal = null;
      gameState.pendingTurnSummary = null;
      hideLetterCinematicOverlay();
      pauseBgm();
      saveToStorage(false);
      renderDefeatEnding();
      return true;
    }

    function checkDefeatEnding() {
      if (!canTriggerDefeatEnding() || isDefeatEndingActive()) {
        renderDefeatEnding();
        return isDefeatEndingActive();
      }
      if (controlledCities().length > 0) {
        renderDefeatEnding();
        return false;
      }
      return triggerDefeatEnding();
    }

    function cityReachDistance(cityId) {
      if (!gameState.cities?.[cityId]) return Infinity;
      const starts = controlledCities().map(city => city.id);
      if (!starts.length) return Infinity;
      if (starts.includes(cityId)) return 0;
      const visited = new Set(starts);
      let frontier = starts;
      for (let depth = 1; depth <= 12; depth += 1) {
        const next = [];
        frontier.forEach(id => {
          const neighbors = cityNeighborIds(id);
          if (!neighbors.length) return;
          neighbors.forEach(neighborId => {
            if (visited.has(neighborId)) return;
            visited.add(neighborId);
            if (neighborId === cityId) {
              next.push(neighborId);
              return;
            }
            next.push(neighborId);
          });
        });
        if (next.includes(cityId)) return depth;
        frontier = next;
        if (!frontier.length) break;
      }
      return Infinity;
    }

    function canOperateAtCity(cityId) {
      if (!gameState.cities?.[cityId]) return false;
      const distance = cityReachDistance(cityId);
      return Number.isFinite(distance) && distance <= 2;
    }

    function canAttackCity(targetId) {
      const target = gameState.cities?.[targetId];
      if (!target) return false;
      if (cityController(targetId) === 'player') return false;
      return controlledCities().some(source => {
        return cityNeighborIds(source.id).includes(targetId) ||
          !!findCampaignRoute(source.id, targetId, 'official');
      });
    }

    function validateCityData() {
      if (!mapData || !gameState?.cities) return null;
      const visible = visibleRegions();
      const visibleIds = new Set(visible.map(region => region.id));
      const allCityIds = new Set(Object.keys(gameState.cities));
      const missingCityData = visible
        .filter(region => !gameState.cities[region.id])
        .map(region => region.id);
      const missingCenter = visible
        .filter(region => !region.center || !Number.isFinite(Number(region.center.x)) || !Number.isFinite(Number(region.center.y)))
        .map(region => region.id);
      const missingPolygon = visible
        .filter(region => !hasMarkedPolygon(region))
        .map(region => region.id);
      const completedCityDataIds = visible
        .filter(region => {
          const cityData = gameState.cities[region.id];
          if (!cityData) return false;
          return CITY_DATA_FIELDS.every(field => {
            const value = cityData[field];
            if (value === undefined || value === null) return false;
            if (Array.isArray(value)) return true;
            if (field === 'garrison') return typeof value === 'object';
            return value !== '';
          });
        })
        .map(region => region.id);
      const badLinks = [];
      Object.values(gameState.cities).filter(c => !isRemovedCityId(c.id)).forEach(cityData => {
        ['neighbors', 'roads', 'waters'].forEach(field => {
          cleanIdArray(cityData[field]).forEach(targetId => {
            if (!allCityIds.has(targetId)) {
              badLinks.push({ id: cityData.id, name: cityData.name, field, targetId });
            }
          });
        });
      });
      const renderedIds = new Set();
      ['domainLayer', 'cityLayer'].forEach(layerId => {
        const layer = document.getElementById(layerId);
        const html = layer ? layer.innerHTML : '';
        [...html.matchAll(/data-select-city="([^"]+)"/g)].forEach(match => renderedIds.add(match[1]));
      });
      const wronglyRendered = [...renderedIds].filter(id => !visibleIds.has(id));
      const inactiveCityIds = Object.keys(gameState.cities).filter(id => !visibleIds.has(id) || gameState.cities[id].isActive === false);
      const manualCheck = [];
      visible.forEach(region => {
        const cityData = gameState.cities[region.id];
        if (!cityData) return;
        if (!cityData.neighbors.length) manualCheck.push({ id: region.id, name: region.name, reason: '缺少玩法邻接' });
        if (cityData.type === 'pass' && cityData.defense < 60) manualCheck.push({ id: region.id, name: region.name, reason: '关隘城防偏低' });
        if (cityData.type === 'port' && !cityData.waters.length) manualCheck.push({ id: region.id, name: region.name, reason: '港口缺少水路' });
      });
      if (FACTIONS.cao.color !== '#3f79b8') {
        manualCheck.push({ id: 'cao', name: '曹操', reason: '势力颜色不是 #3f79b8' });
      }
      const report = {
        integratedRegionCount: visible.length,
        completedCityDataCount: completedCityDataIds.length,
        inactiveCityIds,
        missingCityData,
        missingCenter,
        missingPolygon,
        badLinks,
        wronglyRendered,
        manualCheck,
        caoColor: FACTIONS.cao.color
      };
      const startGroup = console.groupCollapsed || console.group || console.log;
      const endGroup = console.groupEnd || (() => {});
      startGroup.call(console, '[city data layer] 校验结果');
      console.log('已接入地块数量:', report.integratedRegionCount);
      console.log('已补全地点资料数量:', report.completedCityDataCount);
      console.log('未标定但保留 inactive 的地点:', report.inactiveCityIds);
      console.log('缺少邻接目标的地点:', report.badLinks);
      console.log('需要人工检查的地点:', report.manualCheck);
      console.log('未标定但被错误渲染的城市:', report.wronglyRendered);
      if (console.table && report.badLinks.length) console.table(report.badLinks);
      if (console.table && report.manualCheck.length) console.table(report.manualCheck);
      endGroup.call(console);
      return report;
    }

    function cityTotals() {
      return controlledCities().reduce((acc, city) => {
        acc.food += city.food;
        acc.money += city.money;
        acc.troops += realTroops(city.garrison);
        acc.population += city.population;
        return acc;
      }, { food: 0, money: 0, troops: 0, population: 0 });
    }

    function getMaxActionPoints() {
      const count = controlledCities().length;
      const retinue = gameState.characters.retinue;
      const bonus = gameState.player.actionPointBonuses || {};
      return {
        gov: 1 + count + (gameState.currentAct >= 2 ? 1 : 0) + (bonus.gov || 0),
        mil: 2 + Math.floor(count / 2) + (bonus.mil || 0),
        scheme: 2 + (retinue.network >= 55 ? 1 : 0) + (bonus.scheme || 0),
        dip: 3 + (gameState.player.prestige >= 45 ? 1 : 0) + (bonus.dip || 0),
        inner: 1 + (retinue.loyalty >= 70 ? 1 : 0) + (bonus.inner || 0)
      };
    }

    function resetActionPoints() {
      gameState.actionPoints = getMaxActionPoints();
    }

    function normalizeActionPointsAfterLoad() {
      gameState.actionPoints ||= {};
      const defaults = { gov: 2, mil: 2, scheme: 1, dip: 1, inner: 1 };
      Object.keys(defaults).forEach(key => {
        if (typeof gameState.actionPoints[key] !== 'number') {
          gameState.actionPoints[key] = defaults[key];
        }
      });
    }

    function sanitizeChineseName(value) {
      return Array.from(String(value || '').normalize('NFKC'))
        .filter(char => /[\u3400-\u9fffA-Za-z0-9·._-]/.test(char))
        .join('')
        .slice(0, 12);
    }

    function playerNameLength(value) {
      return Array.from(String(value || '')).reduce((total, char) => {
        return total + (/[\u3400-\u9fff]/.test(char) ? 1 : 0.5);
      }, 0);
    }

    function isValidPlayerName(value) {
      const length = playerNameLength(value);
      return length === 0 || (length >= 2 && length <= 6);
    }

    function randomChineseName() {
      const surnames = ['赵', '沈', '陆', '顾', '谢', '杜', '韩', '苏', '程', '许', '林', '钟'];
      const given = ['景安', '怀瑾', '子衡', '清和', '彦章', '明远', '知行', '文昭', '仲谋', '承礼', '修远', '令仪'];
      return surnames[Math.floor(Math.random() * surnames.length)] + given[Math.floor(Math.random() * given.length)];
    }

    function syncCharacterCreationStageClasses() {
      const characterCreate = document.getElementById('characterCreate');
      if (!characterCreate) return;
      const stageBackgrounds = {
        arrival: './assets/opening/opening_arrival_landscape.png',
        name: './assets/opening/opening_name_study.png',
        identity: './assets/opening/opening_identity_war_camp.png',
        confirm: './assets/opening/opening_identity_war_camp.png'
      };
      ['arrival', 'name', 'identity', 'confirm'].forEach(step => {
        characterCreate.classList.toggle('stage-' + step, characterCreationStep === step);
      });
      characterCreate.dataset.creationStage = characterCreationStep;
      characterCreate.style.setProperty('--creation-bg-image', `url("${stageBackgrounds[characterCreationStep] || stageBackgrounds.arrival}")`);
    }

    function updateCharacterCreation() {
      const input = document.getElementById('playerNameInput');
      const note = document.getElementById('nameValidation');
      const namePreview = document.getElementById('namePreview');
      const start = document.querySelector('[data-start-game]');
      if (!input || !note || !start) return;
      syncCharacterCreationStageClasses();
      if (!isComposingPlayerName && input.value !== characterDraft.name) input.value = characterDraft.name;
      document.querySelectorAll('[data-identity]').forEach(button => {
        button.classList.toggle('selected', button.getAttribute('data-identity') === characterDraft.identity);
      });
      const valid = isValidPlayerName(characterDraft.name);
      note.classList.toggle('bad', !valid);
      note.textContent = valid
        ? '姓名须二至六字；英文与数字按半字计算；若不具名，主簿将代拟入册。'
        : '姓名须二至六字，英文与数字按半字计算。';
      start.disabled = !valid;

      const steps = ['arrival', 'name', 'identity', 'confirm'];
      const currentIndex = steps.indexOf(characterCreationStep);
      document.querySelectorAll('[data-creation-step]').forEach(step => {
        step.classList.toggle('active', step.getAttribute('data-creation-step') === characterCreationStep);
      });
      document.querySelectorAll('[data-dialogue-progress]').forEach(step => {
        const stepIndex = steps.indexOf(step.getAttribute('data-dialogue-progress'));
        step.classList.toggle('current', stepIndex === currentIndex);
        step.classList.toggle('done', stepIndex < currentIndex);
      });

      const identity = PLAYER_IDENTITIES[characterDraft.identity] || PLAYER_IDENTITIES.commandant;
      const draftName = characterDraft.name || '名册待录';
      const speaker = document.getElementById('creationSpeaker');
      const line = document.getElementById('creationLine');
      const voiceMark = document.getElementById('dialogueVoiceMark');
      const identityBrief = document.getElementById('identityBrief');
      const commissionName = document.getElementById('commissionName');
      const commissionIdentity = document.getElementById('commissionIdentity');
      if (namePreview) namePreview.textContent = draftName === '名册待录' ? '名册待录' : '已录 · ' + draftName;
      if (commissionName) commissionName.textContent = draftName;
      if (commissionIdentity) commissionIdentity.textContent = identity.name;
      const identityBriefs = {
        commandant: '朱笔旁批：桂阳都尉。定位军事控局；优势在郡兵与军令，风险是地方士族起初更谨慎。',
        granary: '朱笔旁批：桂阳督粮官。定位屯田后勤；优势在粮草与府库，风险是正面军力略弱。',
        magistrate: '朱笔旁批：桂阳县令。定位民政治安；优势在民心、治安与政务，风险是军事起步较弱。'
      };
      if (identityBrief) identityBrief.textContent = identityBriefs[identity.id] || identityBriefs.commandant;

      const dialogue = {
        arrival: {
          speaker: '荆州牧 · 刘表',
          mark: '刘',
          line: '“桂阳虽远，实为荆南门户。此令不入明堂，只在今夜交予你。”'
        },
        name: {
          speaker: '州府主簿',
          mark: '簿',
          line: '“主公问你名姓，不为虚礼。此名一落，桂阳诸署皆认此令。”'
        },
        identity: {
          speaker: '荆州牧 · 刘表',
          mark: '刘',
          line: '“' + draftName + '，桂阳兵、粮、民心皆不可偏废。你先执哪一柄，便先承哪一重责。”'
        },
        confirm: {
          speaker: '荆州牧 · 刘表',
          mark: '令',
          line: '“刘表已落印，桂阳自此归你节制。先稳门户，再谈天下。”'
        }
      };
      const currentDialogue = dialogue[characterCreationStep] || dialogue.arrival;
      if (speaker) speaker.textContent = currentDialogue.speaker;
      if (line) line.textContent = currentDialogue.line;
      if (voiceMark) voiceMark.textContent = currentDialogue.mark || currentDialogue.speaker.slice(0, 1);
    }

    function getStoredSaveSummary() {
      const candidates = [SAVE_KEY, SAVE_KEY_BACKUP];
      for (const key of candidates) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const stored = JSON.parse(raw);
          if (!sanitizeLoadedData(stored) || !stored.storyFlags?.characterCreated) continue;
          return {
            turn: stored.turn || 1,
            playerName: stored.player?.name || '无名之士',
            savedAt: Number(localStorage.getItem(SAVE_KEY + ':lastSavedAt')) || null
          };
        } catch (_) {
          // 损坏的候选存档会由读取流程尝试回退。
        }
      }
      return null;
    }

    function authUserFromBackend(user) {
      const username = user?.username || 'guest';
      return {
        id: user?.id || null,
        username,
        account: username,
        displayName: user?.displayName || username,
        isGuest: Boolean(user?.isGuest)
      };
    }

    function persistBackendAuthSession(payload) {
      if (!payload?.token || !payload?.user) throw new Error('AUTH_PAYLOAD_INVALID');
      writeBackendSession(payload);
      return authUserFromBackend(payload.user);
    }

    function authErrorMessage(error) {
      const code = error?.payload?.error || error?.message;
      if (code === 'USERNAME_TAKEN') return '这个账号已经被注册了。';
      if (code === 'INVALID_CREDENTIALS') return '账号或密钥不正确。';
      if (code === 'USERNAME_AND_PASSWORD_REQUIRED') return '账号需 3-40 位，只能使用字母、数字、下划线、点、@ 或短横线；密钥至少 6 位。';
      if (code === 'AUTH_PAYLOAD_INVALID') return '后端返回的登录凭证不完整。';
      return error?.message || '未知错误';
    }

    const authApi = {
      async login(payload) {
        const account = payload.account.trim();
        const result = await backendFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: account,
            password: payload.password
          })
        }, { skipAuth: true });
        return { ok: true, user: persistBackendAuthSession(result) };
      },
      async register(payload) {
        const account = payload.account.trim();
        const result = await backendFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: account,
            password: payload.password,
            displayName: account
          })
        }, { skipAuth: true });
        return { ok: true, user: persistBackendAuthSession(result) };
      },
      async guest() {
        const result = await backendFetch('/api/auth/guest', {
          method: 'POST',
          body: JSON.stringify({
            displayName: '游客'
          })
        }, { skipAuth: true });
        return { ok: true, user: persistBackendAuthSession(result) };
      }
    };
    window.sanguoAuthApi = authApi;

    function updateAuthScreen() {
      const screen = document.getElementById('authScreen');
      if (!screen) return;
      screen.querySelectorAll('[data-auth-mode]').forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-auth-mode') === authMode);
      });
      const title = document.getElementById('authPanelTitle');
      const kicker = document.getElementById('authPanelKicker');
      const submit = document.getElementById('authSubmit');
      const password = document.getElementById('authPassword');
      if (title) title.textContent = authMode === 'register' ? '注册新账号' : '登录账号';
      if (kicker) kicker.textContent = authMode === 'register' ? '新牒入册' : '府牒验身';
      if (submit) submit.textContent = authMode === 'register' ? '注册' : '登录';
      if (password) password.autocomplete = authMode === 'register' ? 'new-password' : 'current-password';
    }

    function readAuthPayload() {
      return {
        account: document.getElementById('authAccount')?.value.trim() || '',
        password: document.getElementById('authPassword')?.value || ''
      };
    }

    function setAuthStatus(message, bad = false) {
      const status = document.getElementById('authStatus');
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('bad', bad);
    }

    function enterMainMenuAfterAuth(user) {
      authUser = user || { account: 'guest', displayName: '游客' };
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authUser));
      } catch (_) {
        // 浏览器隐私模式下无法写入时，保留内存登录态即可。
      }
      launchScreen = 'menu';
      render();
    }

    async function submitAuthForm() {
      const payload = readAuthPayload();
      if (!payload.account) return setAuthStatus('请先写下账号。', true);
      if (payload.password.length < 6) return setAuthStatus('密钥至少需要 6 个字符。', true);
      setAuthStatus(authMode === 'register' ? '正在登记新牒...' : '正在校验府牒...');
      try {
        const result = await authApi[authMode](payload);
        if (!result?.ok) return setAuthStatus(result?.message || '校验未通过。', true);
        enterMainMenuAfterAuth(result.user);
      } catch (error) {
        setAuthStatus('请求后端失败：' + authErrorMessage(error), true);
      }
    }

    async function enterAsGuest() {
      setAuthStatus('正在创建游客身份...');
      try {
        const result = await authApi.guest();
        enterMainMenuAfterAuth(result.user);
      } catch (error) {
        setAuthStatus('游客入口请求后端失败：' + authErrorMessage(error), true);
      }
    }

    function updateMainMenu() {
      const summary = getStoredSaveSummary();
      const continueButton = document.getElementById('continueGame');
      const status = document.getElementById('menuSaveStatus');
      document.querySelectorAll('[data-game-mode-choice]').forEach(button => {
        const active = button.getAttribute('data-game-mode-choice') === selectedNewGameMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (continueButton) continueButton.disabled = !summary;
      if (!status) return;
      if (!summary) {
        status.textContent = '尚无可继续的本地进度。开始新游戏后，序章将从头播放。';
        return;
      }
      const savedAt = summary.savedAt ? new Date(summary.savedAt).toLocaleString('zh-CN') : '时间未知';
      status.textContent = '最近进度｜' + summary.playerName + '｜第 ' + summary.turn + ' 回合｜' + savedAt;
    }

    function renderLaunchLayers() {
      document.getElementById('authScreen')?.classList.toggle('show', launchScreen === 'auth');
      document.getElementById('mainMenu')?.classList.toggle('show', launchScreen === 'menu');
      const characterCreate = document.getElementById('characterCreate');
      characterCreate?.classList.toggle('show', launchScreen === 'character');
      syncCharacterCreationStageClasses();
      document.getElementById('intro')?.classList.toggle('show', launchScreen === 'intro');
      document.getElementById('officeHandoff')?.classList.toggle('show', launchScreen === 'handoff');
      const transition = document.getElementById('openingTransition');
      transition?.classList.toggle('show', launchScreen === 'transition' || launchScreen === 'commissioning');
      transition?.classList.toggle('departure', launchScreen === 'commissioning');
      if (launchScreen !== 'game') {
        clearGuideHighlights();
        removeGuideOverlay();
      }
      updateAuthScreen();
      updateMainMenu();
    }

    function resetRuntimeForNewGame(mode = selectedNewGameMode) {
      clearGuideHighlights();
      removeGuideOverlay();
      gameState = createInitialState();
      initializePlotLinesForMode(mode);
      characterDraft = { name: '', identity: 'commandant' };
      characterCreationStep = 'arrival';
      FACTIONS.player.name = '玩家';
      manualMapRegions = null;
      mapData = createMapData();
      syncMapDataFromGameState();
      if (autosaveTimer) clearInterval(autosaveTimer);
      autosaveTimer = null;
      updateAutosaveDisplay();
    }

    function beginNewGameFlow() {
      stopIntroVideo();
      stopOpeningTransition();
      stopOfficeHandoffTransition();
      resetRuntimeForNewGame(selectedNewGameMode);
      launchScreen = 'intro';
      render();
      beginIntro();
    }

    async function resumeSavedGame(show = true) {
      stopOpeningTransition();
      stopOfficeHandoffTransition();
      const loaded = await loadGameProgress(show);
      if (!loaded || !loaded.storyFlags?.characterCreated) {
        if (show) toast('没有可继续的游戏进度');
        return false;
      }
      gameState = loaded;
      gameState.storyFlags.introSeen = true;
      characterDraft = { name: gameState.player.name || '', identity: gameState.player.identity || 'commandant' };
      FACTIONS.player.name = gameState.player.name || '玩家';
      mapData = createMapData();
      syncMapDataFromGameState();
      normalizeActionPointsAfterLoad();
      launchScreen = 'game';
      startAutosaveTimer();
      updateAutosaveDisplay();
      render();
      startDefaultBgm();
      if (isGuideActive()) processGuidePhase();
      return true;
    }

    function returnToMainMenu() {
      stopIntroVideo();
      stopOpeningTransition();
      stopOfficeHandoffTransition();
      clearGuideHighlights();
      removeGuideOverlay();
      if (gameState.tutorial) gameState.tutorial.forceAction = null;
      launchScreen = 'menu';
      render();
    }

    function startNewCharacter(options = {}) {
      if (gameState.storyFlags.characterCreated) return;
      const identity = PLAYER_IDENTITIES[characterDraft.identity] || PLAYER_IDENTITIES.commandant;
      const name = characterDraft.name || randomChineseName();
      if (!isValidPlayerName(name)) {
        updateCharacterCreation();
        return toast('姓名须二至六字');
      }
      const guiyang = gameState.cities.guiyang;
      characterDraft.name = name;
      gameState.player.name = name;
      if (gameState.characterRoster.player) {
        gameState.characterRoster.player.name = name;
        gameState.characterRoster.player.portraitPlaceholder = name.slice(-2);
      }
      gameState.player.title = identity.title;
      gameState.player.birthplace = '桂阳';
      gameState.player.startingCity = 'guiyang';
      gameState.player.identity = identity.id;
      gameState.player.faction = 'liubiao';
      gameState.player.controller = 'player';
      gameState.player.protection = 100;
      gameState.player.grainEfficiency = 1;
      gameState.player.actionPointBonuses = structuredClone(identity.actionPointBonuses);
      identity.apply(guiyang, gameState);
      gameState.armies[0].commander = name;
      gameState.armies[0].name = name + '亲兵营';
      gameState.storyFlags.characterCreated = true;
      gameState.selectedCityId = 'guiyang';
      FACTIONS.player.name = name;
      captureRegion('guiyang', 'player', null, { render: false, select: false, skipProtectionDecay: true });
      const center = getRegion('guiyang')?.center || guiyang;
      setMapFocusOn(center.x, center.y, 2.55);
      resetActionPoints();
      gameState.storyFlags.introSeen = true;
      if (isStoryMode()) activatePlotLine('liu_biao');
      gameState.currentGoal = getDisplayedCurrentGoal();
      addNews('good', '刘表密令：桂阳实际控制权交予' + gameState.player.name + '。第一阶段目标：稳定桂阳。');
      processPlotLines(gameState.turnEvents);
      launchScreen = 'game';
      updateTabLockStates();
      saveToStorage(false);
      startAutosaveTimer();
      updateAutosaveDisplay();
      render();
      startDefaultBgm();
      const showIntroGuide = () => {
        if (launchScreen !== 'game' || !gameState.storyFlags.characterCreated) return;
        initTutorialGuide();
      };
      if (options.delayGuide) {
        setTimeout(showIntroGuide, 650);
      } else {
        showIntroGuide();
      }
    }

    function renderTutorialCard() {
      if (!gameState.storyFlags.introSeen || gameState.storyFlags.localTrialResolved) return '';
      const step = gameState.storyFlags.tutorialStep || 1;
      if (step === 1) {
        return `<div class="card">
          <h3>初到桂阳</h3>
          <p>你现在掌控桂阳，但这里并非铁板一块。</p>
          <div class="button-grid"><button data-tutorial-next="2">查看地方局势</button></div>
        </div>`;
      }
      if (step === 2) {
        return `<div class="card">
          <h3>先看根基</h3>
          <p>留意人口、粮食、治安、民心、地方豪强影响与刘表庇护值。它们会决定你能否在荆南站稳。</p>
          <div class="button-grid"><button data-tutorial-next="3">记下了</button></div>
        </div>`;
      }
      if (step === 3) {
        return `<div class="card">
          <h3>第一回合建议</h3>
          <p>先整顿治安、安抚士族、屯田或通过城政训练郡兵。眼下不必急着开战。</p>
          <div class="button-grid"><button data-tutorial-next="4">处理地方试探</button></div>
        </div>`;
      }
      return `<div class="card">
        <h3>桂阳豪强试探新任主官</h3>
        <p>郡中几家豪强借商路纠纷聚集部曲，等你表态。</p>
        <div class="button-grid">
          <button data-local-trial="authority">以刘表密令压制</button>
          <button data-local-trial="appease">以利益安抚</button>
          <button data-local-trial="investigate">暗中调查</button>
          <button data-local-trial="recruit">借机收编</button>
        </div>
      </div>`;
    }

    function resolveLocalTrial(choice) {
      if (gameState.storyFlags.localTrialResolved) return;
      const city = gameState.cities.guiyang;
      const clans = gameState.characters.guiyangClans;
      const gentry = gameState.characters.jingnanGentry;
      if (choice === 'authority') {
        city.order = clamp(city.order + 6, 0, 100);
        clans.suspicion = clamp(clans.suspicion + 7, 0, 100);
        addNews('warn', '你出示刘表密令压下豪强试探。局面暂稳，但有人记住了这份锋芒。');
      } else if (choice === 'appease') {
        city.money = Math.max(0, city.money - 220);
        city.publicSupport = clamp(city.publicSupport + 4, 0, 100);
        gentry.trust = clamp(gentry.trust + 7, 0, 100);
        addNews('good', '你以利益换取短期安定，地方士族愿意再观望一阵。');
      } else if (choice === 'investigate') {
        gameState.characters.retinue.network = clamp(gameState.characters.retinue.network + 8, 0, 100);
        clans.suspicion = clamp(clans.suspicion - 3, 0, 100);
        addNews('good', '斥候摸清了几家豪强的往来，亲信网络开始扎根桂阳。');
      } else if (choice === 'recruit') {
        city.garrison.infantry += 120;
        city.order = clamp(city.order - 2, 0, 100);
        applyProtectionDecay(5, '你借豪强试探私自扩充郡兵');
        addNews('warn', '你顺势收编部分部曲，郡兵增加，但襄阳会关注这次扩军。');
      }
      gameState.storyFlags.localTrialResolved = true;
      saveToStorage(false);
      render();
    }

    function render() {
      FACTIONS.player.name = gameState.player.name || '玩家';
      renderHud();
      renderLeftPanel();
      renderMap();
      renderRightPanel();
      renderStrategyDock();
      updateTabLockStates();
      if (launchScreen === 'game') {
        renderModal();
      } else {
        const modalRoot = document.getElementById('gameModalRoot');
        modalRoot?.classList.remove('show');
        if (modalRoot) modalRoot.innerHTML = '';
      }
      document.getElementById('playerRank').textContent = gameState.player.title;
      renderLaunchLayers();
      updateCharacterCreation();
      checkDefeatEnding();
    }

    function renderHud() {
      const totals = cityTotals();
      const items = [
        ['回合 / 日期', isGuideActive() ? '新手引导｜第' + gameState.tutorial.guidePhase + '回合' : '第' + gameState.turn + '回合｜' + formatDate(), 'turnDateHelp'],
        ['当前篇章', getActName()],
        ['当前目标', getDisplayedCurrentGoal(), 'currentGoalHelp'],
        ['粮草', fmt(totals.food)],
        ['府库', fmt(totals.money)],
        ['刘表庇护', gameState.player.protection + ' / 100', 'protectionHelp'],
        ['士族疑心', gameState.characters.jingnanGentry.suspicion + ' / 100', 'gentrySuspicionHelp']
      ];
      document.getElementById('hud').innerHTML = items.map(item => `
        <div class="hud-item"${item[2] ? ' data-help-key="' + item[2] + '"' : ''}><span>${item[0]}</span><strong>${item[1]}</strong></div>
      `).join('');
    }

    function getActName() {
      if (gameState.currentAct === 1) return '荆南立足篇';
      if (gameState.currentAct === 2) return '荆州权力博弈篇';
      return '天下棋局篇';
    }

    function playerRouteTags() {
      const tags = [];
      if (Number(gameState.player.protection || 0) >= 70 && !gameState.player.independent) tags.push('忠臣');
      if (Number(gameState.player.legitimacy || 0) >= 62) tags.push('仁主');
      if (Number(gameState.player.ambition || 0) >= 55 || gameState.player.independent) tags.push('割据者');
      if (Number(gameState.player.fear || 0) >= 48) tags.push('威权');
      if (playerHealers().length) tags.push('济世');
      if (!tags.length) tags.push('观望');
      return tags.slice(0, 4);
    }

    function redemptionLineLabel(id, line) {
      const names = {
        huangZu: '黄祖：江夏赎罪',
        weiYan: '魏延：反骨重塑',
        liuQi: '刘琦：继承求生',
        caiMao: '蔡瑁：权门退路',
        ganNing: '甘宁：锦帆求名',
        huaTuo: '华佗：医者自由',
        wenPin: '文聘：守信之将',
        kuaiYue: '蒯越：谋臣下注',
        huangZhong: '黄忠：老将不伏',
        sunResponse: '孙权：江上旧怨',
        tianFeng: '田丰：囚门死谏',
        xuYou: '许攸：乌巢谋价',
        zhangHe: '张郃：巧变择主',
        xunYu: '荀彧：王佐汉心',
        guoJia: '郭嘉：鬼才病酒',
        guanYu: '关羽：白马义还'
      };
      const status = line?.resolved ? '已抉择' : line?.offered ? '待回应' : '传闻';
      return (names[id] || id) + '｜' + status;
    }

    function renderStoryThreadsPanel() {
      if (!isStoryMode()) return '';
      const lines = redemptionState();
      const activeLines = Object.entries(lines)
        .filter(([, line]) => line && (line.offered || line.resolved))
        .sort((a, b) => Number(b[1].turn || 0) - Number(a[1].turn || 0))
        .slice(0, 5);
      const plagueCities = controlledCities().filter(city => cityPlagueLevel(city.id) > 0);
      const rumors = [
        lines.wenPin ? '' : '守信之将仍在观察你的军令',
        lines.kuaiYue ? '' : '襄阳士族会寻找能保全荆州的人',
        lines.huangZhong ? '' : '长沙旧军中或有老将未伏',
        lines.sunResponse ? '' : '江东终会回应江夏水路的选择'
      ].filter(Boolean).slice(0, 3);
      return `<div class="card">
          <h3>剧情线索</h3>
          <div class="tag-row">${playerRouteTags().map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
          ${plagueCities.length ? `<p class="muted">疫病：${plagueCities.map(city => city.name + ' ' + cityPlagueLevel(city.id) + '/100').join('、')}</p>` : '<p class="muted">疫病：暂无城池染疫。</p>'}
          <div class="orders-list">
            ${activeLines.length ? activeLines.map(([id, line]) => `<div class="order-item">${escapeHtml(redemptionLineLabel(id, line))}</div>`).join('') : '<div class="order-item">尚未发现人物命运线。战役、瘟疫与继承抉择会打开新的线索。</div>'}
          </div>
          ${rumors.length ? `<p class="muted">传闻：${rumors.map(escapeHtml).join('；')}</p>` : ''}
        </div>`;
    }

    function renderLeftPanel() {
      const p = gameState.player;
      const ap = gameState.actionPoints;
      const cities = controlledCities();
      const totals = cityTotals();
      document.getElementById('leftPanel').innerHTML = `
        <div class="card commander-card">
          <div class="commander-heading">
            <span>桂阳署印</span>
            <h3>${p.name}｜${p.title}</h3>
          </div>
          <div class="commander-summary">
            <strong>${cities.length} 座控城</strong>
            <span>驻军 ${fmt(totals.troops)}｜战役槽 ${activeCampaignSlotCount()} / ${p.commandSlots}</span>
          </div>
          <div class="kv-grid commander-facts">
            <div class="kv"><span>声望</span><strong>${fmt(p.prestige)}</strong></div>
            <div class="kv"><span>野心</span><strong>${fmt(p.ambition)}</strong></div>
            <div class="kv"><span>紧急事务</span><strong>${gameState.urgentMatters.filter(item => !item.resolved).length}</strong></div>
            <div class="kv"><span>府库合计</span><strong>${fmt(totals.money)}</strong></div>
          </div>
          ${metric('刘表庇护', p.protection)}
          ${metric('士族信任', gameState.characters.jingnanGentry.trust)}
          ${metric('豪强影响', gameState.characters.guiyangClans.influence)}
          ${metric('合法性', p.legitimacy)}
          ${metric('威慑', p.fear)}
        </div>
        ${renderTutorialTaskBar()}
        ${renderStoryThreadsPanel()}
        <div class="card">
          <h3>本回合行动点</h3>
          <div class="ap-grid">
            ${apBox('政务', ap.gov, 'data-ap="gov"')}
            ${apBox('军令', ap.mil, 'data-ap="mil"')}
            ${apBox('谋略', ap.scheme)}
            ${apBox('外交', ap.dip, 'data-ap="dip"')}
            ${apBox('亲信', ap.inner)}
          </div>
        </div>
        <div class="card">
          <h3>控制城池</h3>
          <div class="tag-row">
            ${cities.map(city => `<button class="ghost-btn" data-select-city="${city.id}">${city.name}</button>`).join('') || '<span class="tag">无</span>'}
          </div>
        </div>
        <div class="card">
          <h3>本回合指令队列</h3>
          <div class="orders-list">
            ${gameState.orders.length ? gameState.orders.map((order, index) => `
              <div class="order-item">${index + 1}. ${escapeHtml(order.label)}</div>
            `).join('') : '<div class="order-item">尚未下令。每座城、每支军队和亲信组织都可以安排本回合行动。</div>'}
          </div>
          <div class="button-grid">
            <button data-clear-orders="1" class="ghost-btn">清空指令</button>
          </div>
        </div>
        <div class="card">
          <h3>战局快报</h3>
          ${gameState.newsFeed.slice(0, 5).map(item => `<div class="news-item ${item.tone || ''}">${item.text}</div>`).join('')}
        </div>
      `;
    }

    function renderStrategyDock() {
      const dock = document.getElementById('strategyDock');
      if (!dock) return;
      const analysis = getLiveStrategyAnalysis();
      dock.innerHTML = analysis.map(item => `
        <div class="strategy-chip ${item.tone}">
          <strong>${item.title}</strong>
          ${item.text}
        </div>
      `).join('');
    }

    function getLiveStrategyAnalysis() {
      const totals = cityTotals();
      const cities = controlledCities();
      const dangerCities = cities
        .map(city => ({ city, eco: calculateCityEconomy(city) }))
        .filter(item => item.eco.netFood < 0 || item.city.publicSupport < 35 || item.city.order < 35)
        .sort((a, b) => a.eco.netFood - b.eco.netFood);
      const frontier = cities.filter(city => cityNeighborIds(city.id).some(id => !isControlledBy(id, 'player')));
      const liuBiao = gameState.characters.liuBiao;
      const gentry = gameState.characters.jingnanGentry;
      const protection = protectionLevel();
      const nextTargets = getRecommendedTargets();
      const chips = [];
      chips.push({
        tone: totals.food < 2500 ? 'bad' : 'good',
        title: '总补给',
        text: '粮 ' + fmt(totals.food) + '｜府库 ' + fmt(totals.money) + '｜控城 ' + cities.length
      });
      chips.push({
        tone: dangerCities.length ? 'bad' : 'good',
        title: dangerCities.length ? '内政警讯' : '内政稳定',
        text: dangerCities.length ? dangerCities[0].city.name + ' 净粮 ' + fmt(dangerCities[0].eco.netFood) + '，民心 ' + Math.round(dangerCities[0].city.publicSupport) : '未发现缺粮或民变高危城。'
      });
      chips.push({
        tone: protection.tone,
        title: '刘表庇护',
        text: Math.round(gameState.player.protection) + '｜' + protection.name + '｜刘表权威 ' + Math.round(liuBiao.authority)
      });
      chips.push({
        tone: gentry.suspicion >= 70 ? 'bad' : gentry.suspicion >= 48 ? 'warn' : 'good',
        title: '荆南士族',
        text: '信任 ' + Math.round(gentry.trust) + '｜疑心 ' + Math.round(gentry.suspicion) + '｜' + gentry.status
      });
      chips.push({
        tone: frontier.length ? 'warn' : 'good',
        title: '周边节点',
        text: frontier.length ? frontier.map(city => city.name).slice(0, 3).join('、') + ' 与桂阳相连' : '暂无直接相连节点'
      });
      const contactRing = reachableTargets(2).filter(city => !isControlledBy(city.id, 'player'));
      chips.push({
        tone: contactRing.length ? 'warn' : 'good',
        title: '可交涉圈',
        text: contactRing.length ? contactRing.slice(0, 4).map(city => city.name).join('、') + ' 可被交涉或刺探' : '周边已暂时安定，需扩大战略触角'
      });
      chips.push({
        tone: 'warn',
        title: '主要战略建议',
        text: nextTargets.length ? nextTargets.join(' / ') : '先整顿桂阳，积累粮草与亲信网络'
      });
      return chips;
    }

    function reachableTargets(maxDepth) {
      return Object.values(gameState.cities)
        .filter(city => !isRemovedCityId(city.id) && city.isActive !== false && !!getRegion(city.id))
        .map(city => ({ city, distance: cityReachDistance(city.id) }))
        .filter(item => item.distance > 0 && item.distance <= maxDepth)
        .sort((a, b) => a.distance - b.distance || b.city.strategic - a.city.strategic)
        .map(item => item.city);
    }

    function getRecommendedTargets() {
      const result = [];
      const controlled = controlledCities();
      if (gameState.currentAct === 1 && gameState.storyFlags.jingnanOpening) {
        const guiyang = gameState.cities.guiyang;
        if (guiyang.order < 62) result.push('整顿桂阳治安');
        if (gameState.characters.jingnanGentry.trust < 55) result.push('安抚荆南士族');
        if (calculateCityEconomy(guiyang).netFood < 800) result.push('桂阳屯田备粮');
        if (guiyang.morale < 64) result.push('训练桂阳郡兵');
        return result.slice(0, 2);
      }
      const weakFrontier = reachableTargets(1)
        .filter(city => !isControlledBy(city.id, 'player'))
        .sort((a, b) => (realTroops(a.garrison) + a.defense * 18) - (realTroops(b.garrison) + b.defense * 18));
      const richContact = reachableTargets(2)
        .filter(city => !isControlledBy(city.id, 'player'))
        .sort((a, b) => (b.agriculture + b.commerce + b.strategic) - (a.agriculture + a.commerce + a.strategic));
      if (!isControlledBy('baima', 'player') && cityReachDistance('baima') <= 1) result.push('夺白马打开黄河线');
      if (weakFrontier[0]) result.push('可考虑压迫 ' + weakFrontier[0].name);
      if (richContact[0]) result.push('派使者试探 ' + richContact[0].name);
      if (controlled.some(city => calculateCityEconomy(city).netFood < 0)) result.unshift('先调低征粮/补足缺粮城');
      if (gameState.storyFlags.yuanDisarm || gameState.characters.yuanShao.alert >= 70) result.push('处理袁绍削权');
      if (gameState.currentAct >= 2 && gameState.characters.caoCao.threat >= 55) result.push('布置官渡防线');
      return result.slice(0, 2);
    }

    function metricHelpKey(label) {
      if (label === '刘表庇护') return 'protectionHelp';
      if (label === '士族疑心') return 'gentrySuspicionHelp';
      if (label === '疫病') return 'plagueHelp';
      return '';
    }

    function metric(label, value) {
      const helpKey = metricHelpKey(label);
      return `<div class="metric"${helpKey ? ' data-help-key="' + helpKey + '"' : ''}><span>${label}</span><div class="meter"><i style="--value:${clamp(value, 0, 100)}%"></i></div><strong>${Math.round(value)}</strong></div>`;
    }

    function apBox(label, value, attr) {
      return `<div class="ap"${attr ? ' ' + attr : ''}><strong>${value}</strong><span>${label}</span></div>`;
    }

    function renderMap() {
      syncMapDataFromGameState();
      normalizeMapView();
      const transform = `translate(${gameState.mapState.panX} ${gameState.mapState.panY}) scale(${gameState.mapState.zoom})`;
      document.getElementById('mapWorld').setAttribute('transform', transform);
      renderMapPatchLayer();
      renderStoryMapLayer();
      renderRoutes();
      renderDetails();
      renderDomains();
      renderOrderArrows();
      renderFxLayer();
      renderCities();
      renderCalibrationLayer();
      renderArmies();
      renderZoomBadge();
    }

    function renderMapPatchLayer() {
      document.getElementById('mapPatchLayer').innerHTML = '';
    }

    function renderStoryMapLayer() {
      const futureNodes = FUTURE_CAMPAIGN_NODES.filter(node => gameState.currentAct >= node.act).map(node => `
        <g class="future-node" transform="translate(${node.x} ${node.y})">
          <circle r="12"></circle>
          <text x="0" y="-20">${node.label}</text>
        </g>
      `).join('');
      document.getElementById('storyMapLayer').innerHTML = futureNodes;
    }

    function renderRoutes() {
      const zoom = gameState.mapState.zoom;
      const visibleRoads = ROUTES.filter(pair => getRegion(pair[0]) && getRegion(pair[1]))
        .filter(pair => zoom >= 1.22 || cityReachDistance(pair[0]) <= 2 || cityReachDistance(pair[1]) <= 2);
      const visibleWaters = WATER_ROUTES.filter(pair => getRegion(pair[0]) && getRegion(pair[1]))
        .filter(pair => zoom >= 1.22 || cityReachDistance(pair[0]) <= 2 || cityReachDistance(pair[1]) <= 2);
      const roadHtml = visibleRoads.map(pair => routePath(pair[0], pair[1], 'route-line')).join('');
      const waterHtml = visibleWaters.map(pair => routePath(pair[0], pair[1], 'route-line water-route')).join('');
      document.getElementById('routeLayer').innerHTML = roadHtml + waterHtml;
    }

    function routePath(aId, bId, cls) {
      const a = getRegion(aId)?.center || gameState.cities[aId];
      const b = getRegion(bId)?.center || gameState.cities[bId];
      if (!a || !b) return '';
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 24;
      return `<path class="${cls}" d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}"></path>`;
    }

    function mapDetailLevel() {
      const zoom = gameState.mapState.zoom;
      if (zoom >= 2.65) return { name: '城郊', rank: 4 };
      if (zoom >= 2.05) return { name: '城防', rank: 3 };
      if (zoom >= 1.45) return { name: '粮道', rank: 2 };
      return { name: '州郡', rank: 1 };
    }

    function renderZoomBadge() {
      const badge = document.getElementById('zoomBadge');
      if (!badge) return;
      badge.textContent = fmtPercent(gameState.mapState.zoom) + '｜' + mapDetailLevel().name;
    }

    function markerScale() {
      return 1 / Math.max(1, gameState.mapState.zoom);
    }

    function renderDetails() {
      const zoom = gameState.mapState.zoom;
      const inv = markerScale();
      const points = MAP_DETAILS.filter(item => zoom >= item.minZoom && getRegion(item.city)).map(item => {
        const city = gameState.cities[item.city];
        const region = getRegion(item.city);
        const color = region ? regionFill(region) : city ? controlColor(city) : '#d9ad58';
        return `
          <g class="detail-point" transform="translate(${item.x} ${item.y}) scale(${inv})">
            <circle r="13" fill="${color}"></circle>
            <text x="0" y="1">${item.type}</text>
            <text class="detail-label" x="0" y="-20">${item.name}</text>
            ${zoom >= item.minZoom + 0.65 ? `<text class="detail-note" x="0" y="29">${item.note}</text>` : ''}
          </g>
        `;
      }).join('');
      const settlements = zoom >= 2.65 ? MAP_DETAILS.filter(item => item.minZoom >= 2.55 && getRegion(item.city)).map(item => `
        <circle class="minor-settlement" cx="${item.x + 21}" cy="${item.y + 16}" r="4"></circle>
        <circle class="minor-settlement" cx="${item.x - 18}" cy="${item.y + 12}" r="3.2"></circle>
      `).join('') : '';
      const routeLabels = ROUTE_DETAILS.filter(item => zoom >= item.minZoom && getRegion(item.from) && getRegion(item.to)).map(item => {
        const from = getRegion(item.from).center;
        const to = getRegion(item.to).center;
        const x = (from.x + to.x) / 2;
        const y = (from.y + to.y) / 2 - 34;
        return `
          <g transform="translate(${x} ${y}) scale(${inv})">
            <text class="route-risk-label" x="0" y="0">${item.name}</text>
            ${zoom >= item.minZoom + 0.55 ? `<text class="detail-note" x="0" y="18">${item.risk}</text>` : ''}
          </g>
        `;
      }).join('');
      document.getElementById('detailLayer').innerHTML = routeLabels + settlements + points;
    }

    function renderDomains() {
      const regions = visibleRegions().map(region => {
        const held = region.nominalOwner !== region.controller && region.controller === 'player';
        const distant = cityReachDistance(region.id) > 2;
        const controlClass = held ? ' nominal-held' : (region.controller === 'player' ? ' player-held' : '');
        const remoteClass = distant ? ' remote-domain' : '';
        const tutorialClass = region.id === 'guiyang' && gameState.storyFlags.introSeen && !gameState.storyFlags.localTrialResolved
          ? ' tutorial-focus'
          : '';
        const baseFill = regionFill(region);
        const points = polygonToString(region.polygon);
        const selected = region.id === gameState.selectedCityId
          ? `<polygon class="city-domain selected-territory" points="${points}" fill="${baseFill}"></polygon>`
          : '';
        return `
          <polygon data-select-city="${region.id}" class="city-domain${controlClass}${remoteClass}${tutorialClass}" points="${points}" fill="${baseFill}"></polygon>
          ${selected}
          ${held ? `<polygon class="nominal-overlay" points="${points}"></polygon>` : ''}
        `;
      }).join('');
      document.getElementById('domainLayer').innerHTML = regions;
    }

    function renderOrderArrows() {
      const queued = gameState.orders.map(order => {
        if (order.type === 'battle') return renderBattleMapVisual(order.payload, false);
        if (order.type === 'transfer') return renderTransferMapVisual(order.payload);
        return '';
      }).join('');
      const preview = gameState.draftBattle ? renderBattleMapVisual(gameState.draftBattle, true) : '';
      document.getElementById('orderLayer').innerHTML = queued + renderCampaignRoutes() + preview;
    }

    function routeCurve(source, target, route, preview, multiOffset = 0) {
      const sourceCity = gameState.cities[source];
      const targetCity = gameState.cities[target];
      const fromRegion = getRegion(source);
      const toRegion = getRegion(target);
      const from = fromRegion ? Object.assign({}, sourceCity, fromRegion.center) : sourceCity;
      const to = toRegion ? Object.assign({}, targetCity, toRegion.center) : targetCity;
      const offset = route === 'raid' ? -76 : route === 'night' ? 58 : route === 'cut' ? -44 : route === 'river' ? 34 : -32;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 + offset + multiOffset;
      return {
        from,
        to,
        midX,
        midY,
        d: `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`,
        previewClass: preview ? ' battle-preview' : ''
      };
    }

    function renderTransferMapVisual(payload) {
      const curve = routeCurve(payload.source, payload.target, 'official', false);
      return `<path class="order-arrow" marker-end="url(#moveHead)" d="${curve.d}"></path>
        <text class="strategy-label" x="${curve.midX}" y="${curve.midY - 12}">调兵 ${fmt(payload.troops)}</text>`;
    }

    function renderBattleMapVisual(payload, preview) {
      const curve = routeCurve(payload.source, payload.target, payload.route, preview);
      const routeClass = {
        river: ' route-river',
        raid: ' route-raid',
        night: ' route-night',
        cut: ' route-cut',
        official: ''
      }[payload.route] || '';
      const tacticClass = payload.tactic === 'siege' ? ' tactic-siege' : '';
      const label = (preview ? '预览：' : '') + battleRouteName(payload.route) + '｜' + battleTacticName(payload.tactic);
      return `
        <path class="order-arrow attack-arrow${routeClass}${tacticClass}${curve.previewClass}" marker-end="url(#arrowHead)" d="${curve.d}"></path>
        <text class="strategy-label" x="${curve.midX}" y="${curve.midY - 15}">${label}</text>
        ${renderBattleStrategyEffects(payload, curve, preview)}
      `;
    }

    function renderBattleStrategyEffects(payload, curve, preview) {
      const inv = markerScale();
      const opacity = preview ? 0.78 : 1;
      const pieces = [];
      if (payload.tactic === 'siege' || payload.objective === 'capture') {
        pieces.push(`<ellipse class="strategy-ring" cx="${curve.to.x}" cy="${curve.to.y}" rx="58" ry="38" opacity="${opacity}"></ellipse>`);
      }
      if (payload.route === 'cut' || payload.objective === 'supply') {
        pieces.push(strategyIcon(curve.midX, curve.midY, '断', '粮道受压', inv, opacity));
      }
      if (payload.route === 'night') {
        pieces.push(strategyIcon(curve.midX, curve.midY, '夜', '夜袭路线', inv, opacity));
      }
      if (payload.route === 'river') {
        pieces.push(strategyIcon(curve.midX, curve.midY, '渡', '沿河推进', inv, opacity));
      }
      if (payload.route === 'raid') {
        pieces.push(strategyIcon(curve.midX, curve.midY, '伏', '绕路奇袭', inv, opacity));
      }
      if (payload.tactic === 'assault') {
        pieces.push(strategyIcon(curve.to.x + 42, curve.to.y - 14, '攻', '强攻城门', inv, opacity));
      }
      if (payload.tactic === 'feint') {
        pieces.push(`<path class="feint-line" opacity="${opacity}" d="M${curve.midX},${curve.midY} Q${curve.midX + 60},${curve.midY - 55} ${curve.to.x + 72},${curve.to.y - 32}"></path>`);
        pieces.push(strategyIcon(curve.to.x + 82, curve.to.y - 42, '佯', '诱敌偏移', inv, opacity));
      }
      if (payload.tactic === 'reserve') {
        pieces.push(`<g transform="translate(${curve.from.x - 58} ${curve.from.y + 38}) scale(${inv})" opacity="${opacity}">
          <rect class="reserve-box" x="-28" y="-14" width="56" height="28" rx="5"></rect>
          <text class="strategy-label" x="0" y="5">预备队</text>
        </g>`);
      }
      return pieces.join('');
    }

    function strategyIcon(x, y, glyph, note, inv, opacity) {
      return `<g class="strategy-icon" transform="translate(${x} ${y}) scale(${inv})" opacity="${opacity}">
        <circle r="17"></circle>
        <text x="0" y="1">${glyph}</text>
        <text class="detail-note" x="0" y="31">${note}</text>
      </g>`;
    }

    function renderCities() {
      const inv = markerScale();
      document.getElementById('cityLayer').innerHTML = visibleRegions().map(region => {
        const city = gameState.cities[region.id];
        const faction = FACTIONS[region.controller] || FACTIONS.local;
        const color = faction.color || (city ? controlColor(city) : FACTIONS.local.color);
        const distant = cityReachDistance(region.id) > 2;
        const remoteClass = distant ? ' remote-city' : '';
        const level = city?.level || region.cityLevel || 2;
        const showFullLabel = !city || !distant || gameState.mapState.zoom >= 1.22 || level >= 5;
        const troopText = compactNumber(city ? realTroops(city.garrison) : region.garrison || 0);
        const foodIcon = !city ? '域' : city.food < 900 ? '缺' : city.resource === '粮仓' ? '粮' : '税';
        return `
          <g class="city-node${remoteClass}" data-select-city="${region.id}" transform="translate(${region.center.x} ${region.center.y}) scale(${inv})">
            <circle class="city-core" cx="0" cy="0" r="${level >= 5 ? 13 : level >= 4 ? 11 : 9}" fill="${color}"></circle>
            <text class="city-label" x="0" y="-22">${escapeHtml(region.name)}</text>
            <text class="city-sub" x="0" y="35">${showFullLabel ? `${faction.short}｜${troopText}` : '远方情报'}</text>
            ${showFullLabel ? `<circle class="resource-icon" cx="30" cy="-18" r="13"></circle>
            <text class="resource-text" x="30" y="-18">${foodIcon}</text>
            <path class="defense-icon" d="M-42 -7 l10 -8 l10 8 v16 q-10 8 -20 0z" fill="${(city?.defense || region.defense || 0) > 58 ? '#233526' : '#2b2115'}"></path>` : ''}
          </g>
        `;
      }).join('');
    }

    function renderCalibrationLayer() {
      const layer = document.getElementById('calibrationLayer');
      if (!layer) return;
      if (!calibrationState.enabled) {
        layer.innerHTML = '';
        return;
      }
      const region = getRegion(calibrationState.selectedRegionId) || getRegion('guiyang');
      const inv = markerScale();
      const vertices = (region.polygon || []).map((point, index) => `
        <g transform="translate(${point[0]} ${point[1]}) scale(${inv})">
          <circle class="calibration-vertex" r="6"></circle>
          <text class="coord-label" x="10" y="-9">${index + 1}</text>
        </g>
      `).join('');
      const last = calibrationState.lastPoint
        ? `<text class="coord-label" x="${calibrationState.lastPoint.x + 12}" y="${calibrationState.lastPoint.y - 12}">x:${Math.round(calibrationState.lastPoint.x)} y:${Math.round(calibrationState.lastPoint.y)}</text>`
        : '';
      layer.innerHTML = `
        <g class="calibration-ui" transform="translate(24 24) scale(${inv})">
          <rect x="0" y="0" width="520" height="86" rx="8"></rect>
          <text x="18" y="28">地图校准模式 Alt+M｜当前：${escapeHtml(region.name)}</text>
          <text x="18" y="56">点击区域选择；Shift+点击添加顶点；拖动紫点改城池中心；E导出 JSON；C清空 polygon</text>
        </g>
        <circle class="calibration-center" data-calibration-center="${region.id}" cx="${region.center.x}" cy="${region.center.y}" r="${10 * inv}"></circle>
        ${vertices}
        ${last}
      `;
    }

    function renderArmies() {
      const inv = markerScale();
      const stationed = gameState.armies.map(army => {
        const city = gameState.cities[army.location];
        const region = getRegion(army.location);
        const anchor = region?.center || city;
        if (!anchor) return '';
        const color = FACTIONS[army.faction].color;
        const dx = army.faction === 'player' ? -26 : 26;
        const dy = 18;
        return `
          <g class="army-banner" transform="translate(${anchor.x + dx} ${anchor.y + dy}) scale(${inv})">
            <path d="M0 28 v-42 h32 l-8 12 l8 12 h-32" fill="${color}"></path>
            <text x="14" y="-18">${compactNumber(realTroops(army.troops))}</text>
          </g>
        `;
      }).join('');
      const marching = gameState.campaigns.filter(campaign => isActiveCampaign(campaign) && isCampaignVisibleOnMap(campaign)).map(campaign => {
        const from = getRegion(campaign.source)?.center || gameState.cities[campaign.source];
        const to = getRegion(campaign.target)?.center || gameState.cities[campaign.target];
        if (!from || !to) return '';
        const progress = campaign.status === 'marching' ? 1 - campaign.travelRemaining / Math.max(1, campaign.eta) : 0.96;
        const x = from.x + (to.x - from.x) * clamp(progress, 0.08, 0.96);
        const y = from.y + (to.y - from.y) * clamp(progress, 0.08, 0.96) - 18;
        const color = FACTIONS[campaign.faction]?.color || FACTIONS.local.color;
        return `<g class="army-banner" transform="translate(${x} ${y}) scale(${inv})">
          <path d="M0 28 v-42 h32 l-8 12 l8 12 h-32" fill="${color}"></path>
          <text x="14" y="-18">${compactNumber(realTroops(campaign.army))}</text>
        </g>`;
      }).join('');
      document.getElementById('armyLayer').innerHTML = stationed + marching;
    }

    function compactNumber(value) {
      if (value >= 10000) return Math.round(value / 10000) + '万';
      if (value >= 1000) return Math.round(value / 1000) + '千';
      return String(Math.round(value));
    }

    function selectCity(cityId, panel) {
      if (!gameState.cities[cityId] && !getRegion(cityId)) return;
      gameState.selectedCityId = cityId;
      gameState.activePanel = panel || 'city';
      if (panel !== 'military') gameState.draftBattle = null;
      // 完成 inspectGuiyang 任务
      if (cityId === 'guiyang' && gameState.tutorial && !getTutorialTask('inspectGuiyang')?.completed) {
        completeTutorialTask('inspectGuiyang');
      }
      render();
    }

    function renderRightPanel() {
      const rightTitle = document.getElementById('rightTitle');
      const rightTag = document.getElementById('rightTag');
      const panel = document.getElementById('rightPanel');
      if (gameState.pendingDefense) {
        const target = gameState.cities[gameState.pendingDefense.target];
        rightTitle.textContent = '敌军来攻';
        rightTag.textContent = target.name;
        panel.innerHTML = renderDefensePanel();
        return;
      }
      if (gameState.activePanel === 'scheme') {
        rightTitle.textContent = '谋略府';
        rightTag.textContent = '改变战局';
        panel.innerHTML = renderSchemePanel();
        return;
      }
      if (gameState.activePanel === 'diplomacy') {
        rightTitle.textContent = '外交帐';
        rightTag.textContent = '借力不只靠打';
        panel.innerHTML = renderDiplomacyPanel();
        return;
      }
      if (gameState.activePanel === 'inner') {
        rightTitle.textContent = '亲信班底';
        rightTag.textContent = '夺权工具';
        panel.innerHTML = renderInnerPanel();
        return;
      }
      if (gameState.activePanel === 'liubiao') {
        rightTitle.textContent = '刘表与荆州';
        rightTag.textContent = protectionLevel().name;
        panel.innerHTML = renderLiuBiaoPanel();
        return;
      }
      if (gameState.activePanel === 'characters') {
        rightTitle.textContent = '人物';
        rightTag.textContent = '荆州人物圈';
        panel.innerHTML = renderCharacterPanel();
        return;
      }
      if (gameState.activePanel === 'appointments') {
        rightTitle.textContent = '任命府';
        rightTag.textContent = controlledCities().length + ' 城｜' + getUnassignedRecruitedCharacters().length + ' 人可任';
        panel.innerHTML = renderAppointmentPanel();
        return;
      }
      if (gameState.activePanel === 'military') {
        rightTitle.textContent = '军府';
        rightTag.textContent = activeCampaignSlotCount() + ' / ' + gameState.player.commandSlots + ' 战役槽';
        panel.innerHTML = renderMilitaryPanel();
        return;
      }
      if (gameState.activePanel === 'transfer') {
        rightTitle.textContent = '调兵';
        rightTag.textContent = '驻军与粮道';
        panel.innerHTML = renderTransferPanel();
        return;
      }
      const city = gameState.cities[gameState.selectedCityId];
      const region = getRegion(gameState.selectedCityId);
      if (!city && region) {
        rightTitle.textContent = '地块详情';
        rightTag.textContent = region.name;
        panel.innerHTML = renderRegionPanel(region);
        return;
      }
      const fallback = city || gameState.cities[gameState.player.startingCity || 'guiyang'];
      rightTitle.textContent = cityReachDistance(fallback.id) > 2 ? '远方情报' : '城池详情';
      rightTag.textContent = fallback.name;
      panel.innerHTML = renderCityPanel(fallback);
    }

    function visibleCharacters() {
      return Object.values(gameState.characterRoster || {}).filter(character =>
        isExternalCharacter(character) &&
        (character.status !== 'hidden' || isFactionLordCharacter(character)) &&
        character.status !== 'dead'
      );
    }

    function characterMatchesFilter(character, filter) {
      if (filter === 'all') return true;
      if (filter === 'recruited') return character.status === 'recruited';
      if (filter === 'contactable') return character.status === 'contactable' || character.status === 'discovered';
      if (filter === 'rumored') return character.status === 'rumored';
      if (filter === 'lords') return isFactionLordCharacter(character);
      if (filter === 'historical') return character.historical;
      if (filter === 'random') return character.randomTalent;
      return character.type === filter;
    }

    function renderCharacterPanel() {
      const filter = gameState.characterFilter || 'all';
      const characters = visibleCharacters().filter(character => characterMatchesFilter(character, filter));
      const profile = gameState.characterRoster?.[gameState.characterProfileId];
      if (profile && !isInternalPlayerCharacterId(profile.id) && (profile.status !== 'hidden' || isFactionLordCharacter(profile)) && profile.status !== 'dead') {
        gameState.selectedCharacterId = profile.id;
        return renderCharacterDetail(profile);
      }
      if (gameState.characterProfileId && !profile) {
        gameState.characterProfileId = null;
      }
      let selected = gameState.characterRoster?.[gameState.selectedCharacterId];
      if (!selected || isInternalPlayerCharacterId(selected.id)) {
        selected = characters[0] || gameState.characterRoster?.liuBiao || null;
        gameState.selectedCharacterId = selected?.id || null;
      }
      const filters = [
        ['all', '全部'], ['recruited', '已招募'], ['contactable', '可接触'], ['rumored', '传闻'],
        ['lords', '主公'], ['historical', '历史人物'], ['random', '随机人物'], ['武将', '武将'], ['谋士', '谋士'], ['政务', '政务']
      ];
      return `
        <div class="card">
          <h2>人物名录</h2>
          <p>眼下只展开桂阳与荆州人物圈。远方名士会随着侦察、来信和重大事件逐步进入视野。</p>
          <div class="character-toolbar">${filters.map(([id, label]) => `<button class="ghost-btn ${filter === id ? 'active' : ''}" data-character-filter="${id}">${label}</button>`).join('')}</div>
          <div class="character-grid">${characters.map(character => renderCharacterCard(character, selected)).join('') || '<div class="turn-event-item">当前筛选下暂无人物。</div>'}</div>
        </div>
      `;
    }

    function renderCharacterCard(character, selected) {
      const isLord = isFactionLordCharacter(character);
      const lordEligibility = isLord ? getLordSolicitationEligibility(character) : null;
      const lordState = isLord ? (lordEligibility.eligible ? '主公｜可招揽' : '主公｜未可招揽') : '';
      const classes = [
        'character-card',
        selected?.id === character.id ? 'selected' : '',
        isLord ? 'lord-card' : '',
        isLord && !lordEligibility.eligible ? 'lord-locked' : ''
      ].filter(Boolean).join(' ');
      return `
        <article class="${classes}" data-open-character-profile="${character.id}" data-select-character="${character.id}" tabindex="0" role="button">
          ${renderCharacterPortrait(character, 'card')}
          <div class="character-card-body">
            <strong>${escapeHtml(character.name)}</strong>
            <small>${escapeHtml(factionName(character.faction))}｜${escapeHtml(character.type)}｜${escapeHtml(character.rarity)}</small>
            <small>${escapeHtml(lordState || characterStatusName(character.status))}</small>
          </div>
        </article>
      `;
    }

    function renderCharacterPortrait(character, context = 'card') {
      const interactive = context === 'detail';
      const label = '查看画像';
      const baseClass = `character-portrait${character.portraitUrl ? ' has-image' : ''}${interactive ? ' portrait-interactive' : ''}`;
      const attrs = interactive
        ? `class="${baseClass}" data-open-character-portrait="${escapeHtml(character.id)}" aria-label="查看${escapeHtml(character.name)}画像" type="button"`
        : `class="${baseClass}" aria-hidden="true"`;
      if (character.portraitUrl) {
        const img = `<img src="${escapeHtml(character.portraitUrl)}" alt="${escapeHtml(character.name)}画像" loading="lazy" onerror="this.closest('.character-portrait')?.classList.add('image-error')">`;
        if (!interactive) {
          return `<div ${attrs}>${img}</div>`;
        }
        return `
          <button ${attrs}>
            ${img}
            <span class="portrait-open-label">${label}</span>
          </button>
        `;
      }
      if (!interactive) return `<div ${attrs}><span>${escapeHtml(character.portraitPlaceholder)}</span></div>`;
      return `<button ${attrs}><span>${escapeHtml(character.portraitPlaceholder)}</span><span class="portrait-open-label">${label}</span></button>`;
    }

    function renderPortraitViewModal(character) {
      if (!character) return '<div class="game-modal"><div class="modal-head"><h2>画像</h2><button class="ghost-btn" data-close-modal="1">关闭</button></div><p class="muted">人物不存在。</p></div>';
      const hasImage = !!character.portraitUrl;
      return `
        <div class="game-modal portrait-view-modal">
          <div class="modal-head">
            <div>
              <h2>${escapeHtml(character.name)}｜画像</h2>
              <span class="tag">${escapeHtml(factionName(character.faction))}｜${escapeHtml(character.role)}｜${escapeHtml(character.rarity)}</span>
            </div>
            <button class="ghost-btn" data-close-modal="1">关闭</button>
          </div>
          <div class="portrait-view-layout">
            <div class="portrait-view-stage ${hasImage ? '' : 'portrait-empty'}">
              ${hasImage
                ? `<img src="${escapeHtml(character.portraitUrl)}" alt="${escapeHtml(character.name)}画像" onerror="this.remove(); this.closest('.portrait-view-stage')?.classList.add('portrait-empty'); this.closest('.portrait-view-stage')?.insertAdjacentHTML('beforeend', '<div>${escapeHtml(character.portraitPlaceholder || character.name.slice(-2))}</div>');">`
                : `<div>${escapeHtml(character.portraitPlaceholder || character.name.slice(-2))}</div>`}
            </div>
            <aside class="portrait-view-info">
              <h3>${escapeHtml(character.name)}</h3>
              <p>${escapeHtml(character.summary || '暂无人物小传。')}</p>
              <div class="kv-grid">
                <div class="kv"><span>统率</span><strong>${character.stats.command}</strong></div>
                <div class="kv"><span>谋略</span><strong>${character.stats.strategy}</strong></div>
                <div class="kv"><span>政务</span><strong>${character.stats.politics}</strong></div>
                <div class="kv"><span>魅力</span><strong>${character.stats.charm}</strong></div>
              </div>
            </aside>
          </div>
        </div>
      `;
    }

    function renderCharacterDetail(character) {
      if (!character) return '';
      const canTalk = !['hidden', 'rumored', 'dead', 'captured'].includes(character.status);
      const isLord = isFactionLordCharacter(character);
      const attitude = getNpcAttitudeLabel(character);
      refreshNpcPlan(character);
      const valueTags = uniqueTextList(character.values || []).map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('');
      const battleTags = getCharacterBattleTags(character).map(item => `<span class="tag battle-tag">${escapeHtml(item)}</span>`).join('');
      const style = character.speechStyle || {};
      const conversationButtons = Object.entries(CONVERSATION_ACTIONS)
        .filter(([id]) => !(isLord && id === 'recruit'))
        .filter(([id]) => id !== 'ally' || isLord)
        .map(([id, action]) => {
          const factionId = character.lordOfFaction || FACTION_LORD_META[character.id]?.faction || character.faction;
          const allianceInfo = id === 'ally' && isLord ? getAllianceEligibility(character) : null;
          const label = id === 'ally' && isLord && isPlayerAlliedWithFaction(factionId) ? '解除盟约' : action.label;
          const disabled = !canTalk || (id === 'ally' && isLord && !allianceInfo?.eligible && !allianceInfo?.allied);
          const help = id === 'ally' && isLord ? ` title="${escapeHtml(allianceInfo?.reason || '')}"` : '';
          return `<button data-conversation="${id}" data-character="${character.id}" ${disabled ? 'disabled' : ''}${help}>${label}</button>`;
        })
        .join('');
      const investigateButton = character.status === 'rumored'
        ? `<button data-investigate-character="${character.id}">调查传闻</button>`
        : '';
      return `<div class="card">
        <div class="character-profile-head">
          <button class="ghost-btn" data-close-character-profile="1">返回名录</button>
          <h2>${escapeHtml(character.name)}</h2>
        </div>
        <div class="character-detail-portrait">
          ${renderCharacterPortrait(character, 'detail')}
        </div>
        <div class="tag-row"><span class="tag">${escapeHtml(character.role)}</span><span class="tag">${escapeHtml(regionName(character.location))}</span><span class="tag">${escapeHtml(characterStatusName(character.status))}</span></div>
        ${battleTags ? `<div class="tag-row character-battle-tags">${battleTags}</div>` : ''}
        <p>${escapeHtml(character.summary)}</p>
        <div class="kv-grid">
          <div class="kv"><span>统率</span><strong>${character.stats.command}</strong></div>
          <div class="kv"><span>谋略</span><strong>${character.stats.strategy}</strong></div>
          <div class="kv"><span>政务</span><strong>${character.stats.politics}</strong></div>
          <div class="kv"><span>魅力</span><strong>${character.stats.charm}</strong></div>
          <div class="kv"><span>信任</span><strong>${fmt(character.trustPlayer)}</strong></div>
          <div class="kv"><span>怀疑</span><strong>${fmt(character.suspicionOfPlayer)}</strong></div>
          <div class="kv"><span>尊重</span><strong>${character.respectPlayer}</strong></div>
          <div class="kv"><span>畏惧</span><strong>${character.fearPlayer}</strong></div>
        </div>
        <div class="button-grid">
          ${investigateButton}
          ${conversationButtons}
        </div>
      </div>
      ${renderLordSolicitationCard(character)}
      ${renderLordAllianceCard(character)}
      <div class="card">
        <h3>目标与自我判断</h3>
        <p><strong>长期目标：</strong>${escapeHtml(character.longTermGoal || '尚未显露。')}</p>
        <p><strong>当前计划：</strong>${escapeHtml(character.currentPlan || '观望局势。')}</p>
        <p><strong>私下盘算：</strong>${escapeHtml(character.privateAgenda || '仍在隐藏真实打算。')}</p>
        <div class="tag-row"><span class="tag">态度：${escapeHtml(attitude)}</span>${valueTags}<span class="tag">${escapeHtml(style.register || '平实')}</span><span class="tag">${escapeHtml(style.rhythm || '平衡')}</span></div>
      </div>
      <div class="card"><h3>内心状态</h3>${renderNpcAgencyCard(character)}</div>
      <div class="card"><h3>人物记忆</h3>${character.memory.length ? character.memory.slice(0, 5).map(memory => `<div class="memory-item">第 ${memory.turn} 回合｜${escapeHtml(repairDisplayText(memory.summary))}</div>`).join('') : '<div class="memory-item">尚无与你相关的记忆。</div>'}</div>
      <div class="card"><h3>可解锁谋略</h3>${renderCharacterSpecialSchemeList(character)}</div>`;
    }

    function renderLordSolicitationCard(character) {
      if (!isFactionLordCharacter(character)) return '';
      const info = getLordSolicitationEligibility(character);
      if (!info.eligible) {
        return `
          <div class="card lord-solicit-card locked">
            <h3>主公招揽</h3>
            <p class="muted">此人是一方主公，不可普通招募。</p>
            <p><strong>看重：</strong>${escapeHtml(info.profile?.focus || '实力与关系')}</p>
            <p>${escapeHtml(info.reason)}</p>
            <div class="kv"><span>我方兵力</span><strong>${fmt(info.playerTroops || 0)}</strong></div>
            <div class="kv"><span>对方兵力</span><strong>${fmt(info.targetTroops || 0)}</strong></div>
            <div class="kv"><span>我方平均民心</span><strong>${Math.round(info.playerPublic || 0)}</strong></div>
            <div class="kv"><span>对方平均民心</span><strong>${Math.round(info.targetPublic || 0)}</strong></div>
            <div class="kv"><span>势力败势压力</span><strong>${Math.round(info.pressure?.pressure || 0)}</strong></div>
            <div class="kv"><span>归附隐患</span><strong>${Math.round(info.pressure?.grievance || 0)}</strong></div>
            ${info.details?.failed?.length ? `<p class="muted">不足：${info.details.failed.map(item => escapeHtml(item.label + ' ' + item.detail)).join('；')}</p>` : ''}
            <button disabled>条件不足，无法招揽</button>
          </div>
        `;
      }
      return `
        <div class="card lord-solicit-card">
          <h3>主公招揽</h3>
          <p>你已具备开口资格，但 ${escapeHtml(character.name)} 仍可能观望、争执或反目。</p>
          <p><strong>看重：</strong>${escapeHtml(info.profile?.focus || '实力与关系')}</p>
          <div class="kv"><span>我方兵力</span><strong>${fmt(info.playerTroops || 0)}</strong></div>
          <div class="kv"><span>对方兵力</span><strong>${fmt(info.targetTroops || 0)}</strong></div>
          <div class="kv"><span>我方平均民心</span><strong>${Math.round(info.playerPublic || 0)}</strong></div>
          <div class="kv"><span>对方平均民心</span><strong>${Math.round(info.targetPublic || 0)}</strong></div>
          <div class="kv"><span>尝试成功率</span><strong>${Math.round((info.successChance || 0) * 100)}%</strong></div>
          <div class="kv"><span>势力败势压力</span><strong>${Math.round(info.pressure?.pressure || 0)}</strong></div>
          <div class="kv"><span>归附隐患</span><strong>${Math.round(info.pressure?.grievance || 0)}</strong></div>
          <button data-solicit-lord="${character.id}">招揽此方主公</button>
        </div>
      `;
    }

    function renderNpcAgencyCard(character) {
      const agency = character.npcAgency;
      if (!agency) return '<p>尚未形成足够互动。</p>';
      const stanceLabels = {
        ally: '友善',
        supportive: '支持',
        neutral: '观望',
        suspicious: '怀疑',
        fearful: '畏惧',
        respectfulButDistant: '敬而远之',
        hostile: '敌意'
      };
      const stanceLabel = stanceLabels[agency.relationshipStance] || agency.relationshipStance || '观望';
      const desire = agency.currentDesire || '继续观察';
      const plan = agency.shortTermPlan || character.currentPlan || '观望局势';
      let parts = [];
      parts.push(`<p><strong>关系姿态：</strong><span class="tag">${escapeHtml(stanceLabel)}</span></p>`);
      parts.push(`<p><strong>当前倾向：</strong>${escapeHtml(desire)}</p>`);
      parts.push(`<p><strong>短期计划：</strong>${escapeHtml(plan)}</p>`);
      if (agency.lastPlayerReply) {
        const r = agency.lastPlayerReply;
        parts.push(`<p><strong>最近回应：</strong>第 ${r.turn} 回合｜选择 ${escapeHtml(r.choiceId || '')}</p>`);
      }
      const statusTags = [];
      if (agency.unresolvedPromise && !agency.unresolvedPromise.resolved) statusTags.push('<span class="tag" style="background:rgba(255,200,80,0.2);color:#f2c45a;">未兑现承诺</span>');
      if (agency.grievance && !agency.grievance.resolved) statusTags.push('<span class="tag" style="background:rgba(220,80,60,0.2);color:#e07864;">怨念未消</span>');
      if (agency.favor && !agency.favor.resolved) statusTags.push('<span class="tag" style="background:rgba(100,180,100,0.2);color:#88d17c;">记着恩惠</span>');
      if (agency.pendingConversation) statusTags.push('<span class="tag">期待会谈</span>');
      if (statusTags.length) {
        parts.push(`<div class="tag-row">${statusTags.join('')}</div>`);
      }
      if (gameState.debugMode) {
        parts.push(`<details><summary>调试：完整 npcAgency</summary><pre style="font-size:11px;max-height:200px;overflow:auto;background:rgba(0,0,0,0.3);padding:6px;border-radius:4px;">${escapeHtml(JSON.stringify(agency, null, 2))}</pre></details>`);
      }
      return parts.join('');
    }

    function renderMilitaryPanel() {
      normalizeMilitaryPlannerSelection();
      const hasDraft = !!gameState.draftBattle;
      return [
        renderMilitaryOverviewCard(),
        hasDraft ? renderBattlePlanner() : renderAttackPlannerCard(),
        renderGarrisonStatusCard(),
        renderMilitaryPrepCard(),
        `<div class="card"><div class="button-grid"><button data-tab="transfer">前往调兵</button></div></div>`,
        renderMilitaryOrdersCard(),
        renderCampaignsCard(),
        renderUrgentMattersCard()
      ].join('');
    }

    function renderRetreatCampaignsCard() {
      return '';
    }

    function renderMilitaryOverviewCard() {
      const sourceCities = controlledCities().filter(c => realTroops(c.garrison) > 100);
      const queuedCount = gameState.orders.filter(order => ['battle', 'transfer'].includes(order.type)).length;
      const activeCount = gameState.campaigns.filter(isActiveCampaign).length;
      return `<div class="card">
        <h2>军府总览</h2>
        <div class="kv-grid">
          <div class="kv"><span>本回合军令点</span><strong>${gameState.actionPoints.mil} / ${getMaxActionPoints().mil}</strong></div>
          <div class="kv"><span>战役槽</span><strong>${activeCampaignSlotCount()} / ${gameState.player.commandSlots}</strong></div>
          <div class="kv"><span>可用出兵城</span><strong>${sourceCities.length}</strong></div>
          <div class="kv"><span>待出发军令</span><strong>${queuedCount}</strong></div>
          <div class="kv"><span>进行中战役</span><strong>${activeCount}</strong></div>
        </div>
        <p>出征需要经过道路与地形，抵达之后还要围城。远征不会在一个回合内瞬间结束。</p>
      </div>`;
    }

    function renderAttackPlannerCard() {
      const sourceId = getMilitaryPlannerSourceId();
      if (!sourceId) return `<div class="card"><h3>部署进攻</h3><p>当前无可出兵城池。请先发展城市兵力。</p></div>`;
      const routeMode = (gameState.militaryPlanner && gameState.militaryPlanner.route) || 'official';
      const targets = getAttackableTargetsFrom(sourceId, routeMode);
      const targetId = getMilitaryPlannerTargetId(sourceId, targets);
      const targetData = targets.find(t => t.city.id === targetId);
      const sourceCities = controlledCities().filter(c => realTroops(c.garrison) > 100);
      return `<div class="card" data-military-section="attackPlanner">
        <h3>部署进攻</h3>
        <p>选择出兵城与目标城，先生成作战草案，再进入详细部署。</p>
        <div class="form-row"><span>出兵城</span><select data-military-planner-field="sourceId">
          ${sourceCities.map(c => selectOption(c.id, c.name + '（兵 ' + fmt(realTroops(c.garrison)) + '）', sourceId)).join('')}
        </select></div>
        <div class="form-row"><span>目标城</span><select data-military-planner-field="targetId">
          ${targets.length ? targets.map(t => selectOption(t.city.id, t.city.name + '（距 ' + fmt(t.distance) + '｜ETA ' + fmt(t.eta) + '）', targetId)).join('') : `<option value="">无可攻击目标</option>`}
        </select></div>
        <div class="form-row"><span>预设路线</span><select data-military-planner-field="route">
          ${selectOption('official', '正面官道', routeMode)}
          ${selectOption('river', '沿河推进', routeMode)}
          ${selectOption('raid', '绕路奇袭', routeMode)}
          ${selectOption('night', '夜袭', routeMode)}
          ${selectOption('cut', '断粮道', routeMode)}
        </select></div>
        ${targetData ? `
        <div class="kv-grid" style="margin-top:8px">
          <div class="kv"><span>目标势力</span><strong>${factionName(cityController(targetData.city.id))}</strong></div>
          <div class="kv"><span>守军</span><strong>${fmt(realTroops(targetData.city.garrison))}</strong></div>
          <div class="kv"><span>城防</span><strong>${fmt(targetData.city.defense)}</strong></div>
          <div class="kv"><span>民心</span><strong>${fmt(targetData.city.publicSupport)}</strong></div>
          <div class="kv"><span>粮食</span><strong>${fmt(targetData.city.food)}</strong></div>
          <div class="kv"><span>距离 / ETA</span><strong>${fmt(targetData.distance)} / ${fmt(targetData.eta)} 回合</strong></div>
        </div>` : '<p style="margin-top:8px">所选出兵城在当前路线模式下无可攻击目标。</p>'}
        <div class="button-grid" style="margin-top:8px">
          <button data-start-attack-plan="1" ${targets.length ? '' : 'disabled'}>进入详细部署</button>
        </div>
      </div>`;
    }

    function renderGarrisonStatusCard() {
      const cities = controlledCities();
      if (!cities.length) return '';
      return `<div class="card">
        <h3>驻军状态</h3>
        ${cities.map(city => {
          const total = realTroops(city.garrison);
          const pending = pendingTroopsFrom(city.id);
          const available = Math.max(0, total - 300 - pending);
          return `<div class="campaign-item">
            <strong>${escapeHtml(city.name)}</strong>
            <div>驻军 ${fmt(total)}｜可调 ${fmt(available)}｜士气 ${fmt(city.morale)}｜城防 ${fmt(city.defense)}｜粮 ${fmt(city.food)}</div>
            <p class="muted">${troopBreakdownText(city.garrison)}</p>
            <div class="button-grid" style="margin-top:4px">
              <button class="ghost-btn" data-set-source-city="${city.id}">设为出兵城</button>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }

    function renderMilitaryPrepCard() {
      const selectedCity = gameState.cities[gameState.militaryPlanner?.sourceId || gameState.selectedCityId];
      const cityId = selectedCity && isControlledBy(selectedCity.id, 'player') ? selectedCity.id : (controlledCities()[0]?.id || '');
      return `<div class="card">
        <h3>军事整备</h3>
        <p>对选中的己方城市执行防务整备命令，消耗 1 点军令点。练兵请在城政中进行。</p>
        <div class="button-grid">
          <button data-military-order="drill" data-military-city="${cityId}" ${cityId ? '' : 'disabled'}>整军（士气 +5｜粮 -80）</button>
          <button data-military-order="defense" data-military-city="${cityId}" ${cityId ? '' : 'disabled'}>加固防线（城防 +4｜府库 -80）</button>
          <button data-military-order="reserve" data-military-city="${cityId}" ${cityId ? '' : 'disabled'}>预备队（城防 +2 士气 +2）</button>
        </div>
      </div>`;
    }

    function renderMilitaryOrdersCard() {
      const queued = gameState.orders.filter(order => ['battle', 'transfer'].includes(order.type));
      return `<div class="card"><h3>待出发军令</h3>${queued.length ? queued.map(order => `<div class="campaign-item">${escapeHtml(order.label)}</div>`).join('') : '<div class="campaign-item">暂无待出发军令。</div>'}</div>`;
    }

    function renderCampaignsCard() {
      const active = gameState.campaigns.filter(isActiveCampaign);
      return `<div class="card"><h3>进行中战役</h3>${active.length ? active.map(renderCampaignItem).join('') : '<div class="campaign-item">当前没有长期战役。</div>'}</div>`;
    }

    function renderUrgentMattersCard() {
      const matters = gameState.urgentMatters.filter(item => !item.resolved);
      if (!matters.length) return '';
      return `<div class="card"><h3>紧急事务</h3>${matters.map(item => `<div class="campaign-item"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div>`).join('')}</div>`;
    }

    // 保留旧 renderCampaignPanel 为兼容别名
    function renderCampaignPanel() { return renderMilitaryPanel(); }

    function renderCampaignItem(campaign) {
      const progress = campaign.status === 'marching' ? Math.round((1 - campaign.travelRemaining / Math.max(1, campaign.eta)) * 100) : campaign.status === 'siege' ? Math.round((1 - campaign.siegeRemaining / 2) * 100) : 100;
      const target = gameState.cities[campaign.target];
      const detail = target ? `<div class="campaign-stats">
          <span>我军 ${fmt(realTroops(campaign.army))}</span>
          <span>守军 ${fmt(realTroops(target.garrison))}</span>
          <span>士气 ${fmt(target.morale)}</span>
          <span>城防 ${fmt(target.defense)}</span>
          <span>敌粮 ${fmt(target.food)}</span>
          <span>人口 ${fmt(target.population)}</span>
          <span>府库 ${fmt(target.money)}</span>
          <span>治安 ${fmt(target.order)}</span>
          <span>民心 ${fmt(target.publicSupport)}</span>
          <span>我粮 ${fmt(campaign.supply)}</span>
        </div>` : '';
      const delta = campaign.lastBattleDeltas;
      const deltaPanel = delta ? `<div class="campaign-delta-panel">
          <strong>上轮战果｜${escapeHtml(battleTacticName(delta.tactic))}｜${escapeHtml(battleObjectiveName(delta.objective))}</strong>
          <div class="campaign-stats campaign-delta-stats">
            <span>我军 -${fmt(delta.playerLoss)}</span>
            <span>守军 -${fmt(delta.targetLoss)}</span>
            <span>士气 -${fmt(delta.moraleLoss)}</span>
            <span>城防 -${fmt(delta.defenseLoss)}</span>
            <span>粮草 -${fmt(delta.foodLoss)}</span>
            <span>人口 -${fmt(delta.populationLoss)}</span>
            <span>府库 -${fmt(delta.moneyLoss)}</span>
            <span>治安 -${fmt(delta.orderLoss)}</span>
            <span>民心 -${fmt(delta.supportLoss)}</span>
          </div>
        </div>` : '';
      return `<div class="campaign-item">
        <strong>${escapeHtml(regionName(campaign.source))} → ${escapeHtml(regionName(campaign.target))}</strong>
        <div>${escapeHtml(campaign.phase)}｜ETA ${campaign.travelRemaining || 0}｜粮草 ${campaign.supply} 回合｜兵 ${fmt(realTroops(campaign.army))}</div>
        ${detail}
        ${deltaPanel}
        <div class="campaign-progress"><i style="--value:${clamp(progress, 0, 100)}%"></i></div>
      </div>`;
    }

    function renderRegionPanel(region) {
      const reach = cityReachDistance(region.id);
      const reachText = reach === 0 ? '我方治下' : reach === 1 ? '接壤可行动' : reach === 2 ? '二线可交涉' : '远方情报';
      return `
        <div class="card">
          <h2>${escapeHtml(region.name)}</h2>
          <div class="tag-row">
            <span class="tag">名义：${factionName(region.nominalOwner)}</span>
            <span class="tag">实际：${factionName(region.controller)}</span>
            <span class="tag">${reachText}</span>
          </div>
          <div class="kv-grid" style="margin-top:8px">
            <div class="kv"><span>中心坐标</span><strong>${Math.round(region.center.x)}, ${Math.round(region.center.y)}</strong></div>
            <div class="kv"><span>势力范围</span><strong>${region.polygon.length} 个边界点</strong></div>
            <div class="kv"><span>地块邻接</span><strong>${region.neighbors.map(regionName).join('、') || '未设置'}</strong></div>
          </div>
        </div>
      `;
    }

    function renderCityPanel(city) {
      const economy = calculateCityEconomy(city);
      const region = getRegion(city.id);
      const nominalOwner = cityNominalOwner(city.id);
      const controller = cityController(city.id);
      const own = controller === 'player';
      const canAttack = getAttackSource(city.id);
      const reach = cityReachDistance(city.id);
      const distant = reach > 2;
      const reachText = reach === 0 ? '我方治下' : reach === 1 ? '接壤可行动' : reach === 2 ? '二线可交涉' : '远方情报';
      return `
        <div class="card city-detail-card">
          <div class="city-detail-head">
            <div>
              <h2>${city.name}</h2>
              <div class="city-owner-line">
                <span>名义：${factionName(nominalOwner)}</span>
                <span>实际：${factionName(controller)}</span>
              </div>
            </div>
            <span class="city-reach-mark">${reachText}</span>
          </div>
          <div class="tag-row city-meta-row">
            <span class="tag">等级 ${city.level}</span>
            <span class="tag">${escapeHtml(city.terrain)}</span>
            <span class="tag">${escapeHtml(city.resource)}</span>
            <span class="tag">前线价值 ${city.strategic}</span>
            ${region ? `<span class="tag">控制区：${region.resources.map(escapeHtml).join('、')}</span>` : ''}
          </div>
          <div class="kv-grid city-core-grid">
            <div class="kv"><span>人口</span><strong>${fmt(city.population)}</strong></div>
            <div class="kv"><span>驻军</span><strong>${distant ? '约' + compactNumber(realTroops(city.garrison)) : fmt(realTroops(city.garrison))}</strong></div>
            <div class="kv"><span>存粮</span><strong>${fmt(city.food)}</strong></div>
            <div class="kv"><span>府库</span><strong>${fmt(city.money)}</strong></div>
            <div class="kv"><span>农业</span><strong>${Math.round(city.agriculture)}</strong></div>
            <div class="kv"><span>商业</span><strong>${Math.round(city.commerce)}</strong></div>
            <div class="kv"><span>税收贡献</span><strong id="taxIncome-${city.id}">${fmt(economy.taxIncome)} / 回合</strong></div>
            <div class="kv"><span>净粮</span><strong id="netFood-${city.id}">${economy.netFood >= 0 ? '+' : ''}${fmt(economy.netFood)}</strong></div>
          </div>
          <p class="muted city-troop-breakdown">${troopBreakdownText(city.garrison)}</p>
          <div class="city-secondary-grid">
            <div class="kv"><span>粮食产能</span><strong id="foodProd-${city.id}">${fmt(economy.foodProduction)} / 回合</strong></div>
            <div class="kv"><span>粮食消耗</span><strong id="foodConsume-${city.id}">${fmt(economy.foodConsumption)} / 回合</strong></div>
            ${region ? `<div class="kv"><span>地块邻接</span><strong>${region.neighbors.map(regionName).join('、') || '未设置'}</strong></div>` : ''}
            ${region ? `<div class="kv"><span>势力范围</span><strong>${region.polygon.length} 个边界点</strong></div>` : ''}
          </div>
          <div class="city-status-block">
            ${metric('民心', city.publicSupport)}
            ${metric('治安', city.order)}
            ${metric('士气', city.morale)}
            ${metric('城防', city.defense)}
            ${isStoryMode() && cityPlagueLevel(city.id) > 0 ? metric('疫病', cityPlagueLevel(city.id)) : ''}
          </div>
          ${renderCityStrategicEffects(city)}
          <p class="muted city-support-note">民心：${Math.round(city.publicSupport)}｜${publicSupportLabel(city)}：${publicSupportRiskText(city)}</p>
        </div>
        <div class="card">
          <h3>政策与局势判断</h3>
          <p id="policyLine-${city.id}">${distant ? '距离我方控制区超过两层势力范围，只能读取概况，暂不能交涉或出兵。' : ''}税率：${Math.round(city.taxRate)}%（${getTaxModel(city.taxRate).name}）；征粮强度：${Math.round(city.grainRate)}%（${getGrainModel(city.grainRate).name}）。${cityWorthHint(city, economy)}</p>
          <div class="tag-row">
            ${cityNeighborIds(city.id).map(id => `<button class="ghost-btn" data-select-city="${id}">${regionName(id)}</button>`).join('')}
          </div>
        </div>
        ${own ? renderCityAppointmentSummary(city) : ''}
        ${own ? renderOwnCityActions(city) : renderOtherCityActions(city, canAttack)}
      `;
    }

    function renderCityStrategicEffects(city) {
      const effects = getCityStrategicEffects(city);
      if (!effects.tags.length) return '';
      const tagHtml = effects.tags
        .map(tag => `<span class="tag" title="${escapeHtml(tag.desc)}">${escapeHtml(tag.label)}</span>`)
        .join('');
      return `
        <div class="city-strategy-effects">
          <div class="tag-row">${tagHtml}</div>
          <p class="muted">特产收益：农业 +${fmt(effects.agriculture)}｜商业 +${fmt(effects.commerce)}｜城防 +${fmt(effects.defense)}｜战略 +${fmt(effects.strategic)}｜陆兵 ${fmtPercent(effects.training.land)}｜骑兵 ${fmtPercent(effects.training.cavalry)}｜水兵 ${fmtPercent(effects.training.navy)}</p>
        </div>
      `;
    }

    function renderPolicyImpact(city) {
      const economy = calculateCityEconomy(city);
      const netMoney = economy.taxIncome - economy.grainCost;
      const pill = (label, value, display) => `<span class="impact-pill ${value >= 0 ? 'good' : 'bad'}">${label} ${value >= 0 ? '+' : ''}${display ?? fmt(Math.round(value))}</span>`;
      return [
        pill('府库', netMoney, fmt(netMoney)),
        pill('净粮', economy.netFood, fmt(economy.netFood)),
        pill('民心', economy.publicDelta, fmt(economy.publicDelta)),
        pill('治安', economy.orderDelta, fmt(economy.orderDelta)),
        `<span class="impact-pill">收粮成本 ${fmt(economy.grainCost)}</span>`
      ].join('');
    }

    function syncPolicyReadouts(city) {
      const tax = getTaxModel(city.taxRate);
      const grain = getGrainModel(city.grainRate);
      const economy = calculateCityEconomy(city);
      const taxReadout = document.getElementById('taxReadout-' + city.id);
      const grainReadout = document.getElementById('grainReadout-' + city.id);
      const impact = document.getElementById('policyImpact-' + city.id);
      const foodProd = document.getElementById('foodProd-' + city.id);
      const taxIncome = document.getElementById('taxIncome-' + city.id);
      const foodConsume = document.getElementById('foodConsume-' + city.id);
      const netFood = document.getElementById('netFood-' + city.id);
      const policyLine = document.getElementById('policyLine-' + city.id);
      if (taxReadout) taxReadout.textContent = Math.round(city.taxRate) + '%｜' + tax.name;
      if (grainReadout) grainReadout.textContent = Math.round(city.grainRate) + '%｜' + grain.name;
      if (impact) impact.innerHTML = renderPolicyImpact(city);
      if (foodProd) foodProd.textContent = fmt(economy.foodProduction) + ' / 回合';
      if (taxIncome) taxIncome.textContent = fmt(economy.taxIncome) + ' / 回合';
      if (foodConsume) foodConsume.textContent = fmt(economy.foodConsumption) + ' / 回合';
      if (netFood) netFood.textContent = (economy.netFood >= 0 ? '+' : '') + fmt(economy.netFood);
      if (policyLine) policyLine.textContent = '税率：' + Math.round(city.taxRate) + '%（' + tax.name + '）；征粮强度：' + Math.round(city.grainRate) + '%（' + grain.name + '）。' + cityWorthHint(city, economy);
    }

    function updatePolicySlider(cityId, domain, value) {
      const city = gameState.cities[cityId];
      if (!city || !isControlledBy(cityId, 'player')) return;
      if (domain === 'tax') city.taxRate = clamp(Number(value), 0, 100);
      if (domain === 'grain') city.grainRate = clamp(Number(value), 0, 100);
      normalizeCityPolicy(city);
      syncPolicyReadouts(city);
      renderHud();
      renderLeftPanel();
      renderStrategyDock();
    }

    function renderAppointmentPanel() {
      normalizeAppointments(gameState);
      return [
        renderAppointmentOverviewCard(),
        renderCityAppointmentManagerList(),
        renderCampaignCommanderAppointmentPanel(),
        renderUnassignedCharactersCard()
      ].join('');
    }

    function renderAppointmentOverviewCard() {
      const cities = controlledCities();
      const recruited = Object.values(gameState.characterRoster || {}).filter(c => c && c.status === 'recruited' && isExternalCharacter(c));
      const administrators = cities.reduce((sum, city) => sum + getCityOfficials(city.id, 'administratorId').length, 0);
      const military = cities.reduce((sum, city) => sum + getCityOfficials(city.id, 'militaryOfficerId').length, 0);
      const policies = cities.reduce((sum, city) => sum + getCityOfficials(city.id, 'policyOfficerId').length, 0);
      const commanders = (gameState.campaigns || []).filter(c => c.faction === 'player' && c.type === 'attack' && isActiveCampaign(c) && getCampaignCommander(c)).length;

      return `<div class="card">
        <h2>任命总览</h2>
        <div class="kv-grid">
          <div class="kv"><span>控制城池</span><strong>${cities.length}</strong></div>
          <div class="kv"><span>已招募人物</span><strong>${recruited.length}</strong></div>
          <div class="kv"><span>未任命人物</span><strong>${getUnassignedRecruitedCharacters().length}</strong></div>
          <div class="kv"><span>已任主政官</span><strong>${administrators}</strong></div>
          <div class="kv"><span>已任军事官</span><strong>${military}</strong></div>
          <div class="kv"><span>已任政策官</span><strong>${policies}</strong></div>
          <div class="kv"><span>已任战役主将</span><strong>${commanders}</strong></div>
        </div>
      </div>`;
    }

    function renderCityAppointmentSummary(city) {
      if (!isControlledBy(city.id, 'player')) return '';

      const admins = getCityOfficials(city.id, 'administratorId');
      const military = getCityOfficials(city.id, 'militaryOfficerId');
      const policies = getCityOfficials(city.id, 'policyOfficerId');

      return `
        <div class="card">
          <h3>城政任命</h3>

          <div class="kv appointment-row">
            <span>主政官</span>
            <strong>${admins.map(c => escapeHtml(c.name)).join('、') || '未任命'} (${admins.length}/${getCityAdministratorLimit(city)})</strong>
            <button class="mini-btn" data-open-appointment-picker="administratorId" data-appointment-city="${city.id}">任命</button>
          </div>

          <div class="kv appointment-row">
            <span>军事官</span>
            <strong>${military.map(c => escapeHtml(c.name)).join('、') || '未任命'} (${military.length}/${getCityMilitaryOfficerLimit(city)})</strong>
            <button class="mini-btn" data-open-appointment-picker="militaryOfficerId" data-appointment-city="${city.id}">任命</button>
          </div>

          <div class="kv appointment-row">
            <span>政策官</span>
            <strong>${policies[0] ? escapeHtml(policies[0].name) : '未任命'}</strong>
            <button class="mini-btn" data-open-appointment-picker="policyOfficerId" data-appointment-city="${city.id}">任命</button>
          </div>

          <div class="button-grid">
            <button data-tab="appointments">前往任命府</button>
          </div>
        </div>
      `;
    }

    function renderCityAppointmentManagerList() {
      const cities = controlledCities();
      const selectedCity = getSelectedAppointmentQuickCity(cities);

      return `
        <div class="card">
          <h3>城市任命</h3>
          ${cities.length ? `
            ${renderAppointmentCityQuickPicker(cities, selectedCity)}
            ${renderCityAppointmentManager(selectedCity)}
          ` : '<p class="muted">当前没有玩家控制城池。</p>'}
        </div>
      `;
    }

    function getSelectedAppointmentQuickCity(cities = controlledCities()) {
      const selectedId = gameState.appointmentQuickCityId || gameState.selectedCityId;
      const selected = cities.find(city => city.id === selectedId);
      const fallback = cities[0] || null;
      if (fallback && (!selected || gameState.appointmentQuickCityId !== selected.id)) {
        gameState.appointmentQuickCityId = (selected || fallback).id;
      }
      return selected || fallback;
    }

    function autoTaskModeLabel(mode) {
      const labels = {
        none: '不执行',
        recruit: '征兵',
        train: '练兵',
        relief: '赈济',
        farming: '屯田',
        defense: '防务',
        order: '治安',
        taxLight: '低税',
        balanced: '均衡',
        grainHeavy: '重粮',
        publicFirst: '民心',
        drill: '整军',
        trainLand: '陆兵',
        trainCavalry: '骑兵',
        trainNavy: '水兵',
        reserve: '预备'
      };
      return labels[mode] || mode;
    }

    function summarizeAutoTask(task) {
      if (!task?.enabled) return '自动化关闭';
      const civilModes = Array.isArray(task.civilModes) ? task.civilModes : [];
      const prepModes = getUniqueAutoTaskModes(task, 'militaryPrepModes', 'militaryPrepMode', MILITARY_PREP_MODE_LIST);
      const parts = [
        task.militaryMode && task.militaryMode !== 'none' ? autoTaskModeLabel(task.militaryMode) : '',
        civilModes.slice(0, 2).map(autoTaskModeLabel).join('、'),
        task.policyMode && task.policyMode !== 'none' ? autoTaskModeLabel(task.policyMode) : '',
        prepModes.slice(0, 2).map(autoTaskModeLabel).join('、')
      ].filter(Boolean);
      return parts.length ? parts.join('｜') : '已开启，待配置';
    }

    function renderAppointmentCityQuickPicker(cities, selectedCity) {
      normalizeAppointments(gameState);
      return `
        <div class="appointment-city-picker">
          <span class="appointment-city-picker-label">任命城市</span>
          ${cities.map(city => {
            const task = gameState.appointments.autoTasks?.[city.id] || {};
            const isSelected = selectedCity?.id === city.id;
            return `
              <button class="appointment-city-chip ${isSelected ? 'selected' : ''}" data-select-appointment-city="${city.id}" data-help="${escapeHtml('点击切换到' + city.name + '的自动化任命部署')}">
                <span class="appointment-city-chip-name">${escapeHtml(city.name)}</span>
                <span class="appointment-city-chip-status ${task.enabled ? 'enabled' : ''}">${task.enabled ? '自动' : '手动'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderCityAppointmentManager(city) {
      if (cityController(city.id) !== 'player') return '';
      normalizeAppointments(gameState);
      const officials = gameState.appointments.cityOfficials[city.id] || {};
      const adminIds = Array.isArray(officials.administratorIds) ? officials.administratorIds : (officials.administratorId ? [officials.administratorId] : []);
      const militaryIds = Array.isArray(officials.militaryOfficerIds) ? officials.militaryOfficerIds : (officials.militaryOfficerId ? [officials.militaryOfficerId] : []);
      const policyId = officials.policyOfficerId || null;
      const officialName = id => getAppointedCharacter(id) ? escapeHtml(getAppointedCharacter(id).name) : '<span class="muted">未任命</span>';
      const renderOfficialSlots = (title, ids, limit, role) => {
        const rows = [];
        for (let i = 0; i < limit; i++) {
          const id = ids[i] || null;
          const removeBtn = id ? ` <button class="ghost-btn mini-btn" data-remove-city-official="1" data-remove-city-official-city="${city.id}" data-remove-city-official-slot="${role}" data-remove-city-official-character="${id}">撤任</button>` : '';
          rows.push(`<div class="appointment-row"><span>${title}${i + 1}/${limit}</span><strong>${id ? officialName(id) : '<span class="muted">未任命</span>'}</strong>${removeBtn}</div>`);
        }
        return rows.join('');
      };
      const policyRemoveBtn = policyId ? ` <button class="ghost-btn mini-btn" data-remove-city-official="1" data-remove-city-official-city="${city.id}" data-remove-city-official-slot="policyOfficerId" data-remove-city-official-character="${policyId}">撤任</button>` : '';

      return `
        <div class="appointment-city-block">
          <div class="appointment-city-heading">
            <h4>${escapeHtml(city.name)}</h4>
            <span>${escapeHtml(summarizeAutoTask(gameState.appointments.autoTasks?.[city.id] || {}))}</span>
          </div>
          <div class="kv"><span>主政官</span><strong>${adminIds.length}/${getCityAdministratorLimit(city)}</strong></div>
          <div class="kv"><span>军事官</span><strong>${militaryIds.length}/${getCityMilitaryOfficerLimit(city)}</strong></div>
          <div class="kv"><span>政策官</span><strong>${policyId ? officialName(policyId) : '未任命'}</strong></div>
          ${renderOfficialSlots('主政官', adminIds, getCityAdministratorLimit(city), 'administratorId')}
          ${renderOfficialSlots('军事官', militaryIds, getCityMilitaryOfficerLimit(city), 'militaryOfficerId')}
          <div class="appointment-row"><span>政策官</span><strong>${policyId ? officialName(policyId) : '<span class="muted">未任命</span>'}</strong>${policyRemoveBtn}</div>
          <div class="button-grid">
            <button data-open-appointment-picker="administratorId" data-appointment-city="${city.id}">任命主政官</button>
            <button data-open-appointment-picker="militaryOfficerId" data-appointment-city="${city.id}">任命军事官</button>
            <button data-open-appointment-picker="policyOfficerId" data-appointment-city="${city.id}">任命政策官</button>
          </div>
          ${renderCityAutoTaskControls(city)}
        </div>
      `;
    }

    function renderCityAutoTaskControls(city) {
      normalizeAppointments(gameState);
      const autoTask = gameState.appointments.autoTasks?.[city.id] || { enabled: false, militaryMode: 'none', civilMode: 'none', civilModes: [], policyMode: 'none', militaryPrepMode: 'none', militaryPrepModes: [] };
      const autoEnabled = autoTask.enabled === true;
      const selectOpts = (current, options) => options.map(o => `<option value="${o[0]}" ${current === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('');
      const checked = (list, mode) => Array.isArray(list) && list.includes(mode) ? 'checked' : '';
      const disabled = !autoEnabled ? 'disabled' : '';
      const militaryOpts = [['none','不执行'],['recruit','自动征兵'],['train','自动练兵']];
      const civilOpts = [['relief','自动赈济'],['farming','自动屯田'],['defense','自动修城防'],['order','自动维护治安']];
      const policyOpts = [['none','不执行'],['taxLight','税率偏低'],['balanced','税粮平衡'],['grainHeavy','征粮偏高'],['publicFirst','民心优先']];
      const prepOpts = [['drill','自动整军'],['defense','自动加固防线'],['reserve','自动部署预备队']];

      return `<div class="appointment-auto-controls">
        <h4>自动治理</h4>
        <div style="margin-bottom:6px">
          <label style="cursor:pointer">
            <input type="checkbox" data-auto-task-field="enabled" data-auto-task-city="${city.id}" ${autoEnabled ? 'checked' : ''} />
            自动治理：${autoEnabled ? '开启' : '关闭'}
          </label>
        </div>
        <div style="margin-bottom:4px">
          <span style="font-size:0.9em">自动兵务：</span>
          <select data-auto-task-field="militaryMode" data-auto-task-city="${city.id}" ${disabled}>
            ${selectOpts(autoTask.militaryMode || 'none', militaryOpts)}
          </select>
        </div>
        <div style="margin-bottom:4px">
          <span style="font-size:0.9em;display:block">自动城政：</span>
          ${civilOpts.map(o => `<label style="display:inline-block;margin-right:8px;cursor:pointer"><input type="checkbox" data-auto-task-city="${city.id}" data-toggle-auto-mode="civilModes" data-auto-mode="${o[0]}" ${checked(autoTask.civilModes, o[0])} ${disabled} /> ${o[1]}</label>`).join('')}
        </div>
        <div style="margin-bottom:4px">
          <span style="font-size:0.9em">自动政策：</span>
          <select data-auto-task-field="policyMode" data-auto-task-city="${city.id}" ${disabled}>
            ${selectOpts(autoTask.policyMode || 'none', policyOpts)}
          </select>
        </div>
        <div>
          <span style="font-size:0.9em;display:block">自动军事整备：</span>
          ${prepOpts.map(o => `<label style="display:inline-block;margin-right:8px;cursor:pointer"><input type="checkbox" data-auto-task-city="${city.id}" data-toggle-auto-mode="militaryPrepModes" data-auto-mode="${o[0]}" ${checked(autoTask.militaryPrepModes, o[0])} ${disabled} /> ${o[1]}</label>`).join('')}
        </div>
      </div>`;
    }

    function renderCampaignCommanderAppointmentPanel() {
      const campaigns = (gameState.campaigns || [])
        .filter(c =>
          c &&
          c.faction === 'player' &&
          c.type === 'attack' &&
          isActiveCampaign(c)
        );

      if (!campaigns.length) {
        return `
          <div class="card">
            <h3>战役主将</h3>
            <p class="muted">当前没有进行中的进攻战役。</p>
          </div>
        `;
      }

      return `
        <div class="card">
          <h3>战役主将</h3>
          ${campaigns.map(c => {
            const commander = getCampaignCommander(c);
            return `
              <div class="appointment-row">
                <div>
                  <strong>${escapeHtml(regionName(c.source))} → ${escapeHtml(regionName(c.target))}</strong>
                  <p class="muted">${escapeHtml(c.phase || c.status)}｜${commander ? '主将：' + escapeHtml(commander.name) : '未任命主将'}</p>
                </div>
                <div class="button-grid">
                  <button data-open-campaign-commander-manager="${c.id}">${commander ? '更换主将' : '任命主将'}</button>
                  ${commander ? `<button data-remove-campaign-commander="${c.id}">撤任</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderUnassignedCharactersCard() {
      const candidates = getUnassignedRecruitedCharacters();
      const roleTags = c => [
        canManageCity(c) ? '<span class="tag">主政</span>' : '',
        canLeadArmy(c) ? '<span class="tag">军事</span>' : '',
        canManageCity(c) ? '<span class="tag">政策</span>' : '',
        canLeadArmy(c) ? '<span class="tag">主将</span>' : ''
      ].filter(Boolean).join('');

      return `<div class="card">
        <h3>未任命人物</h3>
        ${candidates.length ? candidates.map(c => {
          const stats = c.stats || {};
          const mainStats = `统率 ${Math.round(stats.command || 0)}｜谋略 ${Math.round(stats.strategy || 0)}｜政务 ${Math.round(stats.politics || 0)}｜魅力 ${Math.round(stats.charm || 0)}`;
          return `<div class="appointment-candidate">
            <div>
              <strong>${escapeHtml(c.name)}</strong>
              <span class="muted">${escapeHtml(c.type || '')}｜${escapeHtml(c.role || '')}</span>
              <p class="muted">${escapeHtml(mainStats)}</p>
            </div>
            <div class="tag-row">${roleTags(c)}</div>
          </div>`;
        }).join('') : '<p class="muted">暂无未任命人物。</p>'}
      </div>`;
    }

    function renderCityAppointmentCard(city) {
      return renderCityAppointmentManager(city);
    }

    function renderOwnCityActions(city) {
      const tax = getTaxModel(city.taxRate);
      const grain = getGrainModel(city.grainRate);
      return `
        <div class="card">
          <h3>城政命令</h3>
          <div class="button-grid city-order-grid">
            <button data-city-order="recruit" data-city="${city.id}" data-help-key="cityOrder:recruit">征兵</button>
            <button data-city-order="train" data-city="${city.id}" data-help-key="cityOrder:train">练兵</button>
            <button data-city-order="fortify" data-city="${city.id}" data-help-key="cityOrder:fortify">修城防</button>
            <button data-city-order="tuntian" data-city="${city.id}" data-help-key="cityOrder:tuntian">屯田</button>
            <button data-city-order="relief" data-city="${city.id}" data-help-key="cityOrder:relief">赈济</button>
            <button data-city-order="security" data-city="${city.id}" data-help-key="cityOrder:security">整顿治安</button>
          </div>
        </div>
        <div class="card policy-control-card">
          <h3>税粮拨杆</h3>
          <p>政策不再是固定按钮。拖动比例会立刻改变本回合的税收、粮草、民心与治安预测。</p>
          <div class="policy-row">
            <div class="policy-head">
              <strong>税率</strong>
              <span id="taxReadout-${city.id}">${Math.round(city.taxRate)}%｜${tax.name}</span>
            </div>
            <input class="policy-slider tax-slider" data-policy-slider="tax" data-city="${city.id}" type="range" min="0" max="100" step="1" value="${Math.round(city.taxRate)}" aria-label="${city.name}税率">
            <div class="policy-scale"><span>轻税养民</span><span>常规</span><span>重税</span><span>战时</span></div>
          </div>
          <div class="policy-row">
            <div class="policy-head">
              <strong>征粮强度</strong>
              <span id="grainReadout-${city.id}">${Math.round(city.grainRate)}%｜${grain.name}</span>
            </div>
            <input class="policy-slider grain-slider" data-policy-slider="grain" data-city="${city.id}" type="range" min="0" max="100" step="1" value="${Math.round(city.grainRate)}" aria-label="${city.name}征粮强度">
            <div class="policy-scale"><span>平价收粮</span><span>官府征粮</span><span>强征</span><span>搜粟</span></div>
          </div>
          <div class="policy-impact" id="policyImpact-${city.id}">${renderPolicyImpact(city)}</div>
        </div>
      `;
    }

    function renderOtherCityActions(city, canAttack) {
      const reach = cityReachDistance(city.id);
      const canInteract = canOperateAtCity(city.id);
      const lockedReason = reach > 2 ? '此城距离较远，可先侦察或规划跨域远征。' : '当前没有可用路线。';
      return `
        <div class="card">
          <h3>可执行行动</h3>
          <p>${canAttack ? '可规划进攻路线。远方目标将经过多段道路，并按 ETA 逐回合推进。' : lockedReason}</p>
          <div class="button-grid">
            <button data-open-battle="${city.id}" ${canAttack ? '' : 'disabled'}>转入军事部署</button>
            <button data-scheme-action="scout" data-target="${city.id}" ${canInteract ? '' : 'disabled'}>刺探兵力</button>
            <button data-scheme-action="cutSupply" data-target="${city.id}" ${canInteract ? '' : 'disabled'}>查粮道 / 断粮</button>
            <button data-diplomacy-action="lobby" data-target="${city.id}" ${canInteract ? '' : 'disabled'}>拉拢势力</button>
            <button data-diplomacy-action="appeaseLocal" data-target="${city.id}" ${canAppeaseLocalPower(city) && canInteract ? '' : 'disabled'}>招安地方豪强</button>
          </div>
        </div>
      `;
    }

    function cityWorthHint(city, economy) {
      const flags = [];
      if (city.strategic >= 85) flags.push('战略位置极重');
      if (economy.netFood > 1000) flags.push('可供军粮');
      if (city.publicSupport < 35) flags.push('民心危险');
      if (city.defense > 60) flags.push('不宜强攻');
      if (cityController(city.id) === 'liu') flags.push('刘备名望高，结盟价值大');
      if (canAppeaseLocalPower(city)) flags.push('可招安，未必必须攻打');
      return flags.length ? flags.join('，') + '。' : '局势平稳，可按长期目标安排。';
    }

    function renderLordAllianceCard(character) {
      if (!isFactionLordCharacter(character)) return '';
      const info = getAllianceEligibility(character);
      const commonEnemyText = info.commonEnemies?.length ? info.commonEnemies.map(factionName).join('、') : '暂无';
      const outrageText = info.outrageFactions?.length ? info.outrageFactions.map(factionName).join('、') : '暂无';
      const buttonText = info.allied ? '正式解约' : '缔结盟约';
      return `
        <div class="card lord-alliance-card ${info.eligible ? '' : 'locked'}">
          <h3>主公盟约</h3>
          <p><strong>看重：</strong>${escapeHtml(info.profile?.focus || '共同利益')}</p>
          <div class="kv"><span>关系</span><strong>${Math.round(info.relation || 0)}</strong></div>
          <div class="kv"><span>共同敌人</span><strong>${escapeHtml(commonEnemyText)}</strong></div>
          <div class="kv"><span>众愤势力</span><strong>${escapeHtml(outrageText)}</strong></div>
          <div class="kv"><span>对方压力</span><strong>${Math.round(info.pressure?.pressure || 0)}</strong></div>
          <p class="muted">${escapeHtml(info.reason || '')}</p>
          ${info.failed?.length ? `<p class="muted">不足：${info.failed.map(item => escapeHtml(item.label + ' ' + item.detail)).join('；')}</p>` : ''}
          <button data-conversation="ally" data-character="${character.id}" ${info.eligible ? '' : 'disabled'}>${buttonText}</button>
        </div>
      `;
    }

    function battleRouteHelp(route) {
      const table = {
        official: {
          title: '正面官道',
          role: '稳定推进，适合兵力占优或需要公开施压。',
          help: '路线最容易理解，步兵收益稳定，也更容易被诸侯察觉。',
          risk: '缺少奇袭收益，强城会把战斗拖入硬碰硬。'
        },
        river: {
          title: '沿河推进',
          role: '更快抵达，适合有水军或沿江沿河目标。',
          help: 'ETA 略短，水军占比越高，战力收益越明显。',
          risk: '水军不足时收益有限，遇到高城防仍要准备围城。'
        },
        raid: {
          title: '绕路奇袭',
          role: '用机动换突破，适合骑兵较多、想抢时间差。',
          help: '骑兵占比高时战力更好，地图上也会呈现奇袭路线。',
          risk: '行军更慢，粮草和途中风险更容易放大。'
        },
        night: {
          title: '夜袭',
          role: '追求突然性，适合打低士气或已被谋略扰乱的目标。',
          help: '骑兵有额外发挥空间，适合配合刺探、断粮、内应。',
          risk: '若敌城兵力和城防仍强，失败损失会很难看。'
        },
        cut: {
          title: '断粮道',
          role: '不急着破城，先压低敌方粮草和守军状态。',
          help: '适合和“切断粮道”目标搭配，为下一轮主攻铺路。',
          risk: '正面战力较低，不能指望一次就拿下坚城。'
        }
      };
      return table[route] || table.official;
    }

    function battleTacticHelp(tactic) {
      const table = {
        balanced: {
          title: '稳扎稳打',
          role: '默认可靠方案，适合情报不足或兵种均衡。',
          help: '步兵收益稳定，风险和收益都居中。',
          risk: '缺少爆发，面对时间压力时可能不够锋利。'
        },
        assault: {
          title: '强攻夺城',
          role: '提高进攻强度，适合兵力、士气明显占优。',
          help: '预估战力更高，适合配合“夺城”。',
          risk: '失败时损失更重，不适合粮草紧张或敌城防高。'
        },
        siege: {
          title: '围城断粮',
          role: '把战斗拖进消耗，适合敌方粮草或民心较弱。',
          help: '更重视围困与后勤，适合削弱强城。',
          risk: '短期战力略低，会占用战役槽和粮草更久。'
        },
        feint: {
          title: '佯攻诱敌',
          role: '用较小代价制造压力，适合牵制或诱出守军。',
          help: '预估战力略有提升，适合不想立刻吞城的打法。',
          risk: '若目标是硬夺城，效果不如强攻直接。'
        },
        reserve: {
          title: '保留预备队',
          role: '减少冒险，适合守住退路或兵力并不宽裕。',
          help: '更像保守打法，给后续调兵和防守留余地。',
          risk: '进攻压迫力偏低，难以快速解决战斗。'
        }
      };
      return table[tactic] || table.balanced;
    }

    function battleObjectiveHelp(objective) {
      const table = {
        capture: {
          title: '夺城',
          role: '胜利后直接改变实际控制权。',
          help: '获得城池、声望和战略位置，是扩张路线的核心目标。',
          risk: '会提高外部警惕，且失败会损兵折将。'
        },
        contain: {
          title: '牵制',
          role: '胜利后压低敌方士气并制造混乱。',
          help: '适合拖住强敌、保护侧翼，或为外交和调兵争取时间。',
          risk: '不拿城，需要后续行动承接。'
        },
        exhaust: {
          title: '消耗守军',
          role: '胜利后额外削减守军与城防。',
          help: '适合先打一轮削弱坚城，再派主力夺城。',
          risk: '收益偏军事，不会立刻取得地盘。'
        },
        supply: {
          title: '切断粮道',
          role: '胜利后削减敌城粮草、士气并提高混乱。',
          help: '适合配合断粮道路线和围城断粮战术。',
          risk: '正面胜率较低，需要情报和后续围困。'
        }
      };
      return table[objective] || table.capture;
    }

    function renderBattleChoiceHelp(draft, source, target, route, eta) {
      const routeHelp = battleRouteHelp(draft.route);
      const tacticHelp = battleTacticHelp(draft.tactic);
      const objectiveHelp = battleObjectiveHelp(draft.objective);
      const power = estimateBattlePower(draft, source, target);
      const notes = [];
      if (draft.route === 'river') notes.push('水军越多，沿河推进越划算。');
      if (['raid', 'night'].includes(draft.route)) notes.push('骑兵越多，奇袭和夜袭越有价值。');
      if (draft.objective !== 'capture') notes.push('当前目标不夺城，胜利后主要削弱敌城，为下一步铺路。');
      if (!route) notes.push('当前路线不可达，请改选路线或出兵城。');
      else if (Number.isFinite(eta) && eta >= 4) notes.push('行军较久，注意粮草和战役槽占用。');
      if (target.defense >= 60 && draft.tactic === 'assault') notes.push('敌城防偏高，强攻风险较大。');
      return `
        <div class="battle-choice-help">
          <div>
            <strong>路线：${routeHelp.title}</strong>
            <span>${routeHelp.role}</span>
            <small>${routeHelp.help}</small>
            <em>${routeHelp.risk}</em>
          </div>
          <div>
            <strong>战术：${tacticHelp.title}</strong>
            <span>${tacticHelp.role}</span>
            <small>${tacticHelp.help}</small>
            <em>${tacticHelp.risk}</em>
          </div>
          <div>
            <strong>目标：${objectiveHelp.title}</strong>
            <span>${objectiveHelp.role}</span>
            <small>${objectiveHelp.help}</small>
            <em>${objectiveHelp.risk}</em>
          </div>
          <p>当前判断：${power.label}。${notes.join('') || '这个组合比较均衡，可按当前战略目标执行。'}</p>
        </div>
      `;
    }

    function renderBattlePlanner() {
      const draft = gameState.draftBattle;
      const source = gameState.cities[draft.source];
      const target = gameState.cities[draft.target];
      const max = Math.max(0, realTroops(source.garrison) - 300 - pendingTroopsFrom(source.id));
      const route = findCampaignRoute(source.id, target.id, draft.route);
      const eta = calculateTravelTurns(route, { troops: draft.troops, supply: 6 });
      return `
        <div class="card">
          <h2>${source.name} → ${target.name}</h2>
          <p>路线：${route ? route.path.map(regionName).join(' → ') : '无可用路线'}。预计行军 ${Number.isFinite(eta) ? eta : '-'} 回合，抵达后至少围城 2 回合。</p>
          <div class="form-row"><span>参战兵力</span><input data-draft-input="troops" type="text" inputmode="numeric" pattern="[0-9]*" value="${draft.troops}" data-draft-min="100" data-draft-max="${max}"></div>
          <div class="form-row" data-help="${battleRouteHelp(draft.route).help}"><span>出兵路线</span><select data-draft-field="route">
            ${selectOption('official', '正面官道', draft.route)}
            ${selectOption('river', '沿河推进', draft.route)}
            ${selectOption('raid', '绕路奇袭', draft.route)}
            ${selectOption('night', '夜袭', draft.route)}
            ${selectOption('cut', '断粮道', draft.route)}
          </select></div>
          <div class="form-row" data-help="${battleTacticHelp(draft.tactic).help}"><span>战术方案</span><select data-draft-field="tactic">
            ${selectOption('balanced', '稳扎稳打', draft.tactic)}
            ${selectOption('assault', '强攻夺城', draft.tactic)}
            ${selectOption('siege', '围城断粮', draft.tactic)}
            ${selectOption('feint', '佯攻诱敌', draft.tactic)}
            ${selectOption('reserve', '保留预备队', draft.tactic)}
          </select></div>
          <div class="form-row" data-help="${battleObjectiveHelp(draft.objective).help}"><span>作战目标</span><select data-draft-field="objective">
            ${selectOption('capture', '夺城', draft.objective)}
            ${selectOption('contain', '牵制', draft.objective)}
            ${selectOption('exhaust', '消耗守军', draft.objective)}
            ${selectOption('supply', '切断粮道', draft.objective)}
          </select></div>
          ${renderBattleChoiceHelp(draft, source, target, route, eta)}
          <div class="kv-grid">
            <div class="kv"><span>敌守军</span><strong>${fmt(realTroops(target.garrison))}</strong></div>
            <div class="kv"><span>城防</span><strong>${fmt(target.defense)}</strong></div>
            <div class="kv"><span>敌士气</span><strong>${fmt(target.morale)}</strong></div>
            <div class="kv"><span>预估战力</span><strong>${estimateBattlePower(draft, source, target).label}</strong></div>
            <div class="kv"><span>行军 ETA</span><strong>${Number.isFinite(eta) ? eta + ' 回合' : '无路线'}</strong></div>
            <div class="kv"><span>战役槽</span><strong>${activeCampaignSlotCount()} / ${gameState.player.commandSlots}</strong></div>
          </div>
          <div class="button-grid">
            <button data-queue-battle="1">加入本回合军令</button>
            <button class="ghost-btn" data-cancel-draft="1">取消</button>
          </div>
        </div>
      `;
    }

    function selectOption(value, label, current) {
      return `<option value="${value}" ${value === current ? 'selected' : ''}>${label}</option>`;
    }

    function renderTransferPanel() {
      const source = gameState.cities[gameState.selectedCityId] && isControlledBy(gameState.selectedCityId, 'player')
        ? gameState.cities[gameState.selectedCityId]
        : controlledCities()[0];
      if (!source) return '<div class="card"><h3>无可调兵城池</h3></div>';
      const targets = cityNeighborIds(source.id).filter(id => isControlledBy(id, 'player'));
      const draft = gameState.draftTransfer || { source: source.id, target: targets[0] || source.id, troops: 500 };
      if (draft.source !== source.id) gameState.draftTransfer = draft;
      return `
        <div class="card">
          <h2>调兵：${source.name}</h2>
          <p>调兵会减少出发城守军、消耗粮草并增加疲劳。路上若粮道不稳，可能被截击。</p>
          <div class="form-row"><span>目标城</span><select data-transfer-field="target">
            ${targets.map(id => selectOption(id, gameState.cities[id].name, draft.target)).join('') || `<option value="${source.id}">无相邻友城</option>`}
          </select></div>
          <div class="form-row"><span>兵力</span><input data-transfer-input="troops" type="text" inputmode="numeric" pattern="[0-9]*" value="${draft.troops}"></div>
          <div class="button-grid">
            <button data-queue-transfer="${source.id}" ${targets.length ? '' : 'disabled'}>加入调兵令</button>
          </div>
        </div>
      `;
    }

    function renderSchemePanel() {
      const city = gameState.cities[gameState.selectedCityId] || gameState.cities[gameState.player.startingCity || 'guiyang'];
      const canReach = city && canOperateAtCity(city.id);
      const canTargetScheme = canReach && !isControlledBy(city.id, 'player');
      return `
        <div class="card">
          <h2>谋略不是小加成</h2>
          <p>${canReach ? '亲信可以摸清豪强底细、压制粮道、联络内应或散布疑阵。荆南局势未明，先掌握信息再出手。' : city.name + '距离太远，目前只能读到概况，不能派亲信执行谋略。'}</p>
          <div class="button-grid">
            <button data-scheme-action="scout" data-target="${city.id}" ${canReach ? '' : 'disabled'} data-help="刺探<br><span style=&quot;color:var(--good)&quot;>好处：获得目标兵力、城防和粮草信息，提高进攻判断。</span><br><span style=&quot;color:var(--bad)&quot;>代价：失败会提高对方警惕。</span><br>消耗 1 谋略点">刺探 ${city.name}</button>
            <button data-scheme-action="cutSupply" data-target="${city.id}" ${canReach ? '' : 'disabled'} data-help="破坏粮道<br><span style=&quot;color:var(--good)&quot;>好处：降低敌方粮草和士气，适合围城前使用。</span><br><span style=&quot;color:var(--bad)&quot;>代价：失败可能暴露你的敌意。</span><br>消耗 1 谋略点">破坏粮道</button>
            <button data-scheme-action="innerGate" data-target="${city.id}" ${canReach ? '' : 'disabled'} data-help="联络内应<br><span style=&quot;color:var(--good)&quot;>好处：可能降低城防，甚至触发快速破城机会。</span><br><span style=&quot;color:var(--bad)&quot;>代价：难度较高，需要情报网络支持。</span><br>消耗 1 谋略点">联络内应</button>
            <button data-scheme-action="forgeOrder" data-target="${city.id}" ${canReach ? '' : 'disabled'} data-help="散布疑阵 / 伪造调令<br><span style=&quot;color:var(--good)&quot;>好处：扰乱敌方部署，降低援军效率或守军士气。</span><br><span style=&quot;color:var(--bad)&quot;>代价：如果失败，会提升对方戒备。</span><br>消耗 1 谋略点">散布疑阵</button>
          </div>
        </div>
        <div class="card">
          <h3>当前暗线</h3>
          ${metric('豪强影响', gameState.characters.guiyangClans.influence)}
          ${metric('士族疑心', gameState.characters.jingnanGentry.suspicion)}
          ${metric('情报网络', gameState.characters.retinue.network)}
        </div>
        ${renderUnlockedSpecialSchemePanel(city, canTargetScheme)}
      `;
    }

    function renderDiplomacyPanel() {
      ensureAllDiplomacyRecords();
      const selected = gameState.cities[gameState.selectedCityId] || gameState.cities[gameState.player.startingCity || 'guiyang'];
      const canReach = selected && canOperateAtCity(selected.id);
      return `
        <div class="card">
          <h2>外交与拉拢</h2>
          <p>${canReach ? '桂阳初定，先与周边郡县、地方豪强和荆州人物建立往来。外部势力可以接触，但会影响刘表庇护。' : selected.name + '超出两层势力范围，只能观察，不能派使者交涉。'}</p>
          <div class="button-grid">
            <button data-diplomacy-action="appeaseLocal" data-target="${gameState.selectedCityId}" ${canReach ? '' : 'disabled'} data-help="招安地方势力<br><span style=&quot;color:var(--good)&quot;>好处：不战而屈人之兵，获得城池控制权。</span><br><span style=&quot;color:var(--bad)&quot;>代价：消耗府库和声望，不一定成功。</span><br>消耗 1 外交点">招安所选地方势力</button>
            <button data-diplomacy-action="demandFood" data-target="${gameState.selectedCityId}" ${canReach ? '' : 'disabled'} data-help="要求纳粮（威慑）<br><span style=&quot;color:var(--good)&quot;>好处：快速获得粮草补给。</span><br><span style=&quot;color:var(--bad)&quot;>代价：增加敌意，可能损害名声。</span><br>消耗 1 外交点">要求纳粮</button>
            <button data-diplomacy-action="autonomy" data-target="${gameState.selectedCityId}" ${canReach ? '' : 'disabled'} data-help="承认自治换取归附（示好）<br><span style=&quot;color:var(--good)&quot;>好处：提升关系，打开谈判空间。</span><br><span style=&quot;color:var(--bad)&quot;>代价：消耗府库，不一定立刻有回报。</span><br>消耗 1 外交点">承认自治换取归附</button>
            <button data-diplomacy-action="lobby" data-target="${gameState.selectedCityId}" ${canReach ? '' : 'disabled'} data-help="派使者接触（结盟/借道/求援）<br><span style=&quot;color:var(--good)&quot;>好处：降低被攻击风险，为扩张争取时间。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能限制你攻击盟友，也可能被卷入对方战争。</span><br>消耗 1 外交点">派使者接触</button>
          </div>
        </div>
        ${Object.keys(gameState.diplomacy).map(fid => `
          <div class="card">
            <h3>${FACTIONS[fid].name}</h3>
            ${metric('关系', gameState.diplomacy[fid].relation)}
            <p>状态：${gameState.diplomacy[fid].pact}</p>
          </div>
        `).join('')}
      `;
    }

    function renderInnerPanel() {
      const r = gameState.characters.retinue;
      return `
        <div class="card">
          <h2>亲信班底</h2>
          <p>亲兵统领、主簿、粮官与斥候头目会帮助你在桂阳扎根。先把府衙和粮道握稳。</p>
          ${metric('亲信忠诚', r.loyalty)}
          ${metric('情报网络', r.network)}
          ${metric('府衙掌控', r.coup)}
          ${metric('郡兵联络', r.gate)}
          <div class="button-grid">
            <button data-inner-action="organize" data-help="整肃亲兵<br><span style=&quot;color:var(--good)&quot;>好处：提升内部忠诚，降低叛变和被离间风险。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能引起旧部不满。</span><br>消耗 1 亲信点">整肃亲兵</button>
            <button data-inner-action="campGate" data-help="安插府衙亲信<br><span style=&quot;color:var(--good)&quot;>好处：提升府衙控制，减少政令阻力。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能激怒地方郡吏和士族。</span><br>消耗 1 亲信点">安插府衙亲信</button>
            <button data-inner-action="buyOfficer" data-help="联络郡兵小校<br><span style=&quot;color:var(--good)&quot;>好处：提升军队掌控，后续调兵更稳定。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能让刘表或地方势力警惕。</span><br>消耗 1 亲信点">联络郡兵小校</button>
            <button data-inner-action="grainRoute" data-help="掌握桂阳粮道<br><span style=&quot;color:var(--good)&quot;>好处：提高粮食调度能力，支撑出兵和围城。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能触碰豪强利益。</span><br>消耗 1 亲信点">掌握桂阳粮道</button>
            <button data-inner-action="prepareCoup" data-help="建立隐秘班底（扩展情报网络）<br><span style=&quot;color:var(--good)&quot;>好处：解锁谋略系统，提高刺探、断粮、内应成功率。</span><br><span style=&quot;color:var(--bad)&quot;>代价：需要时间和资源，可能暴露行动。</span><br>消耗 1 亲信点">建立隐秘班底</button>
          </div>
        </div>
      `;
    }

    function renderLiuBiaoPanel() {
      const liuBiao = gameState.characters.liuBiao;
      const level = protectionLevel();
      const breakState = liuBiaoBreakState();
      const showBreakControls = isStoryMode();
      const attitude = liuBiaoAttitudeLabel();
      const canDeclare = showBreakControls && !gameState.player.independent && breakState?.status !== 'war' && breakState?.status !== 'surrendered';
      const oldLiuBiaoActionsDisabled = showBreakControls && (gameState.player.independent || breakState?.status === 'war');
      return `
        <div class="card">
          <h2>刘表：荆州牧</h2>
          <p>你受刘表密令赴任桂阳。庇护越强，豪强、士族与外部势力越不敢公开试探；但这份背书会被你的选择消耗。</p>
          ${breakState?.stage === 'war' || gameState.player.independent ? metric('刘表态度', attitude) : metric('刘表庇护', gameState.player.protection)}
          ${metric('刘表权威', liuBiao.authority)}
          ${metric('刘表信任', liuBiao.trust)}
          <div class="tag-row"><span class="tag">${escapeHtml(attitude || level.name)}</span><span class="tag">密令：${escapeHtml(liuBiao.order)}</span></div>
        </div>
        <div class="card">
          <h3>襄阳往来</h3>
          <div class="button-grid">
            <button data-liubiao-action="report" ${oldLiuBiaoActionsDisabled ? 'disabled' : ''} data-help="上报桂阳局势<br><span style=&quot;color:var(--good)&quot;>好处：维持刘表信任，提升合法性。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能暴露你的真实实力和野心。</span><br>消耗 1 外交点">上报桂阳局势</button>
            <button data-liubiao-action="loyal" ${oldLiuBiaoActionsDisabled ? 'disabled' : ''} data-help="表明忠心<br><span style=&quot;color:var(--good)&quot;>好处：提高庇护和信任，降低外部势力敌意。</span><br><span style=&quot;color:var(--bad)&quot;>代价：短期不利于独立扩张路线。</span><br>消耗 1 外交点">表明忠心</button>
            <button data-liubiao-action="supplies" ${oldLiuBiaoActionsDisabled ? 'disabled' : ''} data-help="请求兵粮<br><span style=&quot;color:var(--good)&quot;>好处：快速获得粮草或资源，帮助桂阳度过前期。</span><br><span style=&quot;color:var(--bad)&quot;>代价：可能消耗刘表信任或庇护，不能频繁使用。</span><br>消耗 1 外交点">请求兵粮</button>
            <button data-liubiao-action="conceal" ${oldLiuBiaoActionsDisabled ? 'disabled' : ''} data-help="隐瞒扩张准备<br><span style=&quot;color:var(--good)&quot;>好处：避免刘表过早察觉你的独立意图。</span><br><span style=&quot;color:var(--bad)&quot;>代价：一旦被发现，信任暴跌。</span><br>消耗 1 外交点">隐瞒扩张准备</button>
            ${showBreakControls ? `<button data-liubiao-declare-independent="1" ${canDeclare ? '' : 'disabled'} data-help="宣告自立<br><span style=&quot;color:var(--good)&quot;>庇护高时，刘表悲痛不解，曹操与孙权短期观望。</span><br><span style=&quot;color:var(--bad)&quot;>庇护较低时，会触发通牒甚至直接开战。</span>">宣告自立</button>` : ''}
          </div>
        </div>
        ${breakState ? `<div class="card">
          <h3>刘表态度</h3>
          <p>${escapeHtml(attitude)}</p>
          <div class="tag-row">
            <span class="tag">阶段：${escapeHtml(String(breakState.stage || breakState.status || ''))}</span>
            ${breakState.startedTurn ? `<span class="tag">起始回合：${breakState.startedTurn}</span>` : ''}
            ${breakState.caoSunObserveUntil ? `<span class="tag">曹孙观望至第 ${breakState.caoSunObserveUntil} 回合</span>` : ''}
          </div>
        </div>` : ''}
        <div class="card">
          <h3>荆州人物</h3>
          <p>蔡瑁：${escapeHtml(characterStatusName(gameState.characters.caiMao.status))}｜蒯越：${escapeHtml(characterStatusName(gameState.characters.kuaiYue.status))}｜黄祖：${escapeHtml(characterStatusName(gameState.characters.huangZu.status))}｜文聘：${escapeHtml(characterStatusName(gameState.characters.wenPin.status))}</p>
        </div>
      `;
    }

    function renderYuanPanel() {
      const y = gameState.characters.yuanShao;
      const canCoup = gameState.storyFlags.yechengInside >= 55 && gameState.characters.retinue.coup >= 55 && gameState.player.prestige >= 45;
      const canAttackYe = gameState.storyFlags.openConflict || y.alert >= 82 || controlledCities().length >= 3;
      return `
        <div class="card">
          <h2>袁绍：最终障碍</h2>
          <p>你越强，袁绍越怕。这里可以主动推进夺权，不必等待事件空降。</p>
          ${metric('袁绍权威', y.authority)}
          ${metric('袁绍警戒', y.alert)}
          ${metric('袁绍信任', y.trust)}
          <div class="tag-row"><span class="tag">状态：${escapeHtml(characterStatusName(y.status))}</span><span class="tag">本营：邺城</span></div>
        </div>
        <div class="card">
          <h3>夺袁行动</h3>
          <div class="button-grid">
            <button data-yuan-action="loyalVisit">表忠请安</button>
            <button data-yuan-action="audience">请求入邺面见</button>
            <button data-yuan-action="plantInside">安插邺城内应</button>
            <button data-yuan-action="xuYouPlan">拉拢许攸夺权</button>
            <button data-yuan-action="oldGuard">联络袁军旧部</button>
            <button data-yuan-action="prepareCoup">逼宫准备</button>
            <button data-yuan-action="launchCoup" ${canCoup ? '' : 'disabled'}>发动逼宫</button>
            <button data-yuan-action="rejectDisarm" ${gameState.storyFlags.yuanDisarm ? '' : 'disabled'}>拒绝削权</button>
            <button data-yuan-action="attackYe" ${canAttackYe ? '' : 'disabled'}>起兵攻邺</button>
          </div>
        </div>
      `;
    }

    function renderDefensePanel() {
      const defense = gameState.pendingDefense;
      const target = gameState.cities[defense.target];
      const attacker = gameState.cities[defense.source];
      return `
        <div class="card">
          <h2>${FACTIONS[defense.faction].name}来攻 ${escapeHtml(target.name)}</h2>
          <p>${attacker.name}方向敌军逼近。你必须选择防守方针，战斗不会自动替你决定。</p>
          <div class="kv-grid">
            <div class="kv"><span>敌军估计</span><strong>${fmt(defense.troops)}</strong></div>
            <div class="kv"><span>我方守军</span><strong>${fmt(realTroops(target.garrison))}</strong></div>
            <div class="kv"><span>城防</span><strong>${fmt(target.defense)}</strong></div>
            <div class="kv"><span>民心</span><strong>${fmt(target.publicSupport)}</strong></div>
          </div>
          <div class="button-grid">
            <button data-defense-choice="hold">固守城池</button>
            <button data-defense-choice="field">出城迎战</button>
            <button data-defense-choice="scorched">坚壁清野</button>
            <button data-defense-choice="nightRaid">夜袭敌营</button>
            <button data-defense-choice="retreat">撤退保存实力</button>
            <button data-defense-choice="fakeSurrender">假降诱敌</button>
          </div>
        </div>
      `;
    }

    function getPublicSupportEconomyModifier(city) {
      const ps = Number(city.publicSupport || 0);
      if (ps >= 70) return { food: 1.08, tax: 1.05, recruit: 1.05, publicDelta: 0.2, orderDelta: 0.3, label: '民心稳固' };
      if (ps >= 50) return { food: 1, tax: 1, recruit: 1, publicDelta: 0, orderDelta: 0, label: '民心尚可' };
      if (ps >= 30) return { food: 0.88, tax: 0.92, recruit: 0.84, publicDelta: 0, orderDelta: -0.5, label: '民心不安' };
      if (ps >= 10) return { food: 0.7, tax: 0.76, recruit: 0.62, publicDelta: -0.35, orderDelta: -1.4, label: '民怨积压' };
      if (ps > 0) return { food: 0.52, tax: 0.56, recruit: 0.4, publicDelta: -0.8, orderDelta: -2.5, label: '民变边缘' };
      return { food: 0.25, tax: 0.25, recruit: 0.12, publicDelta: -5, orderDelta: -8, label: '民心崩溃' };
    }

    function publicSupportLabel(city) {
      const ps = Number(city.publicSupport || 0);
      if (ps >= 75) return '归心';
      if (ps >= 55) return '安定';
      if (ps >= 35) return '不安';
      if (ps >= 20) return '怨起';
      if (ps > 0) return '危急';
      return '崩溃';
    }

    function publicSupportRiskText(city) {
      const ps = Number(city.publicSupport || 0);
      const mod = getPublicSupportEconomyModifier(city);
      if (ps <= 0) return '可能起义、倒戈、泄密，守城极弱';
      if (ps < 10) return '产粮、税收、征兵重挫，战时可能开城';
      if (ps < 30) return '产粮、税收、征兵下降，治安持续恶化';
      return mod.label;
    }

    function calculateCityEconomy(city) {
      normalizeCityPolicy(city);
      const bonus = getRegionBonus(city.id);
      const labor = clamp(city.population / 100000, 0.35, 3.2);
      const publicMod = getPublicSupportEconomyModifier(city);
      const orderFactor = clamp(0.55 + city.order / 120, 0.45, 1.35);
      const warFactor = clamp(1 - city.warDamage / 140, 0.45, 1);
      const tax = getTaxModel(city.taxRate);
      const grain = getGrainModel(city.grainRate);
      const grainEfficiency = isControlledBy(city.id, 'player') ? (gameState.player.grainEfficiency || 1) : 1;
      const foodProduction = Math.round((city.agriculture + (bonus.agriculture || 0)) * labor * orderFactor * warFactor * grain.food * grainEfficiency * publicMod.food * 58);
      const foodConsumption = Math.round(labor * 640 + realTroops(city.garrison) * 0.62 + city.warDamage * 14);
      const taxIncome = Math.round((city.commerce + (bonus.commerce || 0)) * labor * orderFactor * tax.tax * grain.growth * publicMod.tax * 34);
      return {
        foodProduction,
        foodConsumption,
        netFood: foodProduction - foodConsumption,
        taxIncome,
        grainCost: grain.moneyCost,
        commerceFactor: tax.commerce,
        publicDelta: tax.public + grain.public + publicMod.publicDelta + (foodProduction < foodConsumption ? -2.6 : 0) + (city.warDamage > 20 ? -1.4 : 0),
        orderDelta: tax.order + grain.order + publicMod.orderDelta + (realTroops(city.garrison) > city.population * 0.035 ? -0.8 : 0),
        growth: tax.growth * grain.growth
      };
    }

    function publicSupportStabilityDelta(city, eco) {
      const ps = Number(city.publicSupport || 0);
      const order = Number(city.order || 0);
      const warDamage = Number(city.warDamage || 0);
      const foodStress = eco.foodProduction < eco.foodConsumption;
      const target = publicSupportGovernanceTarget(city, eco);
      let recovery = 0;
      if (ps < target && order >= 35) recovery += clamp((target - ps) / 18, 0.3, 3.2);
      if (ps < 60 && order >= 45 && !foodStress && !cityHasMajorDisruption(city, eco)) recovery += 0.7;
      if (ps < target - 12 && order >= 60 && !foodStress) recovery += 0.6;
      if (ps > target + 8 && (city.taxRate > 55 || city.grainRate > 55 || foodStress)) recovery -= clamp((ps - target) / 24, 0, 1.1);
      if (warDamage > 25) recovery -= clamp(warDamage / 60, 0.3, 1.2);
      return recovery;
    }

    function applyEconomicPublicSupportDelta(city, eco) {
      const rawDelta = Number(eco.publicDelta || 0) + publicSupportStabilityDelta(city, eco);
      const ps = Number(city.publicSupport || 0);
      const minDelta = ps >= 60 ? -2.8 : ps >= 45 ? -1.6 : ps >= 25 ? -0.9 : -0.4;
      city.publicSupport = clamp(ps + Math.max(rawDelta, minDelta), 0, 100);
    }

    function npcNormalPublicSupportDelta(city, eco) {
      const ps = Number(city.publicSupport || 0);
      if (ps < 60) return clamp((60 - ps) / 4, 1, 2);
      const target = publicSupportGovernanceTarget(city, eco);
      const seed = stableHash(city.id + ':' + gameState.turn + ':npcPublic');
      let delta = (seed % 2 === 0 ? 1 : -1) * (1 + (Math.floor(seed / 7) % 2));
      if (ps < target - 5 && delta < 0) delta = Math.abs(delta);
      if (ps > target + 8 && delta > 0) delta = -delta;
      return clamp(delta, -2, 2);
    }

    function driftNpcStat(city, key, target, maxStep = 1.5, floor = 0) {
      const current = Number(city[key] || 0);
      const gap = Number(target || 0) - current;
      if (Math.abs(gap) < 0.1) return;
      city[key] = clamp(current + clamp(gap / 8, -maxStep, maxStep), floor, 100);
    }

    function applyNpcNormalStability(city, eco) {
      if (!city || cityController(city.id) === 'player') return false;
      const controller = cityController(city.id);
      if (!controller || !FACTIONS[controller]) return false;
      const npcDisrupted = Number(city.warDamage || 0) >= 25 ||
        Number(city.taxRate || 0) >= 82 ||
        Number(city.grainRate || 0) >= 82 ||
        Number(city.publicSupport || 0) <= 0 ||
        activeCampaignsTargetingCity(city.id).length > 0;
      if (npcDisrupted) return false;

      city.publicSupport = clamp(Number(city.publicSupport || 0) + npcNormalPublicSupportDelta(city, eco), 60, 88);
      const profile = factionGovernanceProfile(controller);
      const orderTarget = clamp(58 + (Number(profile.order || 50) - 50) * 0.35 + Number(city.level || 1) * 1.2, 60, 84);
      const moraleTarget = clamp(56 + (Number(profile.virtue || 50) - 50) * 0.18 + Number(city.level || 1) * 1.1, 60, 82);
      const defenseTarget = clamp(42 + Number(city.level || 1) * 6 + Number(city.strategic || 50) / 12, 55, 86);
      driftNpcStat(city, 'order', orderTarget, 1.5, 55);
      driftNpcStat(city, 'morale', moraleTarget, 1.3, 55);
      driftNpcStat(city, 'defense', defenseTarget, 1.1, 45);
      city.food = Math.max(Number(city.food || 0), Math.round(Number(city.population || 0) * 0.012 + realTroops(city.garrison) * 0.45));
      return true;
    }

    function processNpcCityRecruitment(city, eco, reports) {
      const controller = cityController(city.id);
      if (!controller || controller === 'player') return false;
      if (!FACTIONS[controller]) return false;
      if (city.publicSupport <= 0 || city.order <= 0) return false;

      const currentTroops = realTroops(city.garrison);
      const localScale = controller === 'local' ? 0.45 : 1;
      const targetCap = Math.max(500, Math.round(city.population * (controller === 'local' ? 0.024 : 0.052)));
      if (currentTroops >= targetCap) return false;

      const publicMod = getPublicSupportEconomyModifier(city);
      const borderPressure = cityNeighborIds(city.id).some(neighborId => {
        const neighborController = cityController(neighborId);
        return neighborController && neighborController !== controller;
      }) ? 1.18 : 1;
      const underAttack = activeCampaignsTargetingCity(city.id).length > 0 ? 1.35 : 1;
      const needRatio = clamp((targetCap - currentTroops) / Math.max(1, targetCap), 0.25, 1.35);
      const warDamagePenalty = clamp(1 - Number(city.warDamage || 0) / 180, 0.45, 1);
      const baseRate = Number(city.recruitBase || 0.012);
      const rawAmount = Math.round(
        city.population *
        baseRate *
        (0.11 + Number(city.level || 1) * 0.018) *
        publicMod.recruit *
        borderPressure *
        underAttack *
        needRatio *
        warDamagePenalty *
        localScale
      );

      if (rawAmount <= 0) return false;

      const foodCost = Math.max(20, Math.round(rawAmount * 0.72));
      const moneyCost = Math.max(12, Math.round(rawAmount * 0.36));
      const foodRatio = city.food >= foodCost ? 1 : clamp(city.food / Math.max(1, foodCost), 0.15, 1);
      const moneyRatio = city.money >= moneyCost ? 1 : clamp(city.money / Math.max(1, moneyCost), 0.2, 1);
      const resourceRatio = Math.min(foodRatio, moneyRatio);
      const amount = Math.min(targetCap - currentTroops, Math.max(25, Math.round(rawAmount * resourceRatio)));
      if (amount <= 0) return false;

      city.food = Math.max(0, Number(city.food || 0) - Math.round(foodCost * resourceRatio));
      city.money = Math.max(0, Number(city.money || 0) - Math.round(moneyCost * resourceRatio));
      city.population = Math.max(8000, Number(city.population || 0) - Math.round(amount * 0.42));
      city.garrison.infantry = Math.max(0, Number(city.garrison.infantry || 0) + Math.round(amount * 0.64));
      city.garrison.archers = Math.max(0, Number(city.garrison.archers || 0) + Math.round(amount * 0.24));
      city.garrison.cavalry = Math.max(0, Number(city.garrison.cavalry || 0) + Math.round(amount * 0.12));
      city.morale = clamp(Number(city.morale || 0) + (resourceRatio >= 0.85 ? 0.8 : 0.25), 0, 100);

      if (amount >= NPC_RECRUITMENT_REPORT_THRESHOLD && cityReachDistance(city.id) <= 2) {
        reports.push({
          tone: 'warn',
          level: 'minor',
          text: factionName(controller) + '在' + city.name + '补充兵力 ' + fmt(amount) + '，周边战备正在恢复。'
        });
      }
      return true;
    }

    function queueCityOrder(cityId, action) {
      const city = gameState.cities[cityId];
      if (!city || !isControlledBy(cityId, 'player')) return toast('只有实际控制城池才能下城政命令');
      if (!spendPoint('gov')) return;
      const labelMap = {
        recruit: '征兵',
        train: '练兵',
        trainLand: '练陆兵',
        trainCavalry: '练骑兵',
        trainNavy: '练水兵',
        fortify: '修城防',
        tuntian: '屯田',
        relief: '赈济',
        security: '整顿治安'
      };
      gameState.orders.push({
        id: uid(),
        type: 'city',
        point: 'gov',
        label: city.name + '：' + labelMap[action],
        payload: { cityId, action }
      });
      toast('已加入指令：' + city.name + ' ' + labelMap[action]);
      // 完成 firstCityOrder 任务
      if (gameState.tutorial && !getTutorialTask('firstCityOrder')?.completed) {
        completeTutorialTask('firstCityOrder');
      }
      saveToStorage(false);
      render();
    }

    function queuePolicy(cityId, domain, value) {
      const city = gameState.cities[cityId];
      if (!city || !isControlledBy(cityId, 'player')) return toast('只能调整自己实际控制城池的政策');
      if (!spendPoint('gov')) return;
      const policyName = domain === 'tax' ? TAX_POLICIES[value].name : GRAIN_POLICIES[value].name;
      gameState.orders.push({
        id: uid(),
        type: 'city',
        point: 'gov',
        label: city.name + '：改行' + policyName,
        payload: { cityId, action: 'policy', domain, value, rate: policyRateFromKey(domain, value) }
      });
      render();
    }

    function queueBattle() {
      const draft = gameState.draftBattle;
      if (!draft) return;
      const source = gameState.cities[draft.source];
      const target = gameState.cities[draft.target];
      if (activeCampaignSlotCount() + pendingLongCampaignCount() >= gameState.player.commandSlots) return toast('当前战役槽已满。请结束现有战役、撤军，或提升军府能力后再发动新战役。');
      if (!findCampaignRoute(source.id, target.id, draft.route)) return toast('目标城池暂无可用行军路线');
      const availableTroops = Math.max(0, realTroops(source.garrison) - 300 - pendingTroopsFrom(source.id));
      if (availableTroops < 100) return toast('该城没有足够的可调兵力');
      draft.troops = clamp(Number(draft.troops) || 0, 100, availableTroops);
      if (!spendPoints('mil', 2)) return;
      gameState.orders.push({
        id: uid(),
        type: 'battle',
        point: 'mil',
        pointCost: 2,
        label: source.name + '出兵' + target.name + '｜' + battleRouteName(draft.route) + '｜' + battleTacticName(draft.tactic),
        payload: structuredClone(draft)
      });
      gameState.draftBattle = null;
      gameState.activePanel = 'military';
      saveToStorage(false);
      toast('进攻军令已加入队列');
      render();
    }

    function queueMilitaryOrder(cityId, action) {
      if (!cityId || !action) return;
      const city = gameState.cities[cityId];
      if (!city || !isControlledBy(cityId, 'player')) return toast('只能对自己控制的城池下达军事整备命令');
      if (SPECIAL_TRAINING_ACTIONS[action]) return toast('练兵请通过城政执行');
      if (!spendPoints('mil', 1)) return;
      const labelMap = { drill: '整军', defense: '加固防线', reserve: '预备队' };
      gameState.orders.push({
        id: uid(),
        type: 'military',
        point: 'mil',
        pointCost: 1,
        label: city.name + '：' + (labelMap[action] || action),
        payload: { cityId, action }
      });
      saveToStorage(false);
      toast((labelMap[action] || action) + '命令已加入队列');
      render();
    }

    function queueTransfer(sourceId) {
      const draft = gameState.draftTransfer || {};
      const source = gameState.cities[sourceId];
      const target = gameState.cities[draft.target];
      if (!source || !target || !isControlledBy(source.id, 'player') || !isControlledBy(target.id, 'player') || !cityNeighborIds(source.id).includes(target.id)) return toast('调兵目标必须是相邻友城');
      const availableTroops = Math.max(0, realTroops(source.garrison) - 300 - pendingTroopsFrom(source.id));
      if (availableTroops < 100) return toast('该城没有足够的可调兵力');
      const amount = clamp(Number(draft.troops) || 0, 100, availableTroops);
      if (!spendPoints('mil', 1)) return;
      gameState.orders.push({
        id: uid(),
        type: 'transfer',
        point: 'mil',
        pointCost: 1,
        label: source.name + '调兵 ' + fmt(amount) + ' 至 ' + target.name,
        payload: { source: source.id, target: target.id, troops: amount }
      });
      toast('调兵令已加入队列');
      render();
    }

    function queueScheme(action, targetId, options = {}) {
      const target = gameState.cities[targetId] || gameState.cities.yecheng;
      if (target && target.id && isControlledBy(target.id, 'player')) {
        return toast('谋略不能对自己控制的城池使用');
      }
      if (action === 'specialCharacterScheme') {
        const character = gameState.characterRoster?.[options.characterId];
        const scheme = String(options.scheme || '');
        const state = specialSchemeUnlockState(character);
        if (!character || !scheme || !getCharacterSpecialSchemes(character).includes(scheme)) return toast('该特殊谋略暂不可用');
        if (!state.unlocked) return toast(state.reason);
        if (target && target.id && !canOperateAtCity(target.id)) return toast('距离太远，暂不能执行该人物谋略');
        if (!spendPoint('scheme')) return;
        gameState.orders.push({
          id: uid(),
          type: 'scheme',
          point: 'scheme',
          label: scheme + '：' + character.name,
          payload: { action, targetId: target.id, characterId: character.id, scheme }
        });
        toast('人物特殊谋略已加入队列');
        render();
        return;
      }
      if (target && target.id && !canOperateAtCity(target.id) && !['xuyou', 'caoPact', 'yuanRumor'].includes(action)) {
        return toast('距离太远，亲信和斥候暂时够不到 ' + target.name);
      }
      if (!spendPoint('scheme')) return;
      const names = {
        scout: '刺探兵力',
        cutSupply: '破坏粮道',
        innerGate: '联络内应',
        forgeOrder: '伪造军令',
        xuyou: '拉拢许攸',
        caoPact: '暗通曹操',
        yuanRumor: '散布袁绍失德流言'
      };
      gameState.orders.push({
        id: uid(),
        type: 'scheme',
        point: 'scheme',
        label: names[action] + '：' + target.name,
        payload: { action, targetId: target.id }
      });
      toast('谋略已加入队列');
      render();
    }

    function queueDiplomacy(action, target) {
      const cityTarget = gameState.cities[target];
      if (cityTarget && !canOperateAtCity(cityTarget.id)) return toast(cityTarget.name + '距离太远，暂不能交涉');
      if (!spendPoint('dip')) return;
      const names = {
        allyLiu: '拉刘备为盟友',
        useGongsun: '借公孙瓒牵制袁绍',
        caoFood: '向曹操借粮',
        lobby: '拉拢势力',
        appeaseLocal: '招安地方豪强',
        demandFood: '要求纳粮',
        autonomy: '承认自治换取归附'
      };
      gameState.orders.push({
        id: uid(),
        type: 'diplomacy',
        point: 'dip',
        label: names[action],
        payload: { action, target }
      });
      render();
    }

    function queueInner(action) {
      if (!spendPoint('inner')) return;
      const names = {
        organize: '整肃亲兵',
        campGate: '安插府衙亲信',
        spyYecheng: '刺探外部势力',
        buyOfficer: '联络郡兵小校',
        grainRoute: '掌握桂阳粮道',
        prepareCoup: '建立隐秘班底',
        gateRaid: '控制要害门户'
      };
      gameState.orders.push({
        id: uid(),
        type: 'inner',
        point: 'inner',
        label: names[action],
        payload: { action }
      });
      // 完成 organizeRetinue 任务
      if (gameState.tutorial && !getTutorialTask('organizeRetinue')?.completed) {
        completeTutorialTask('organizeRetinue');
      }
      render();
    }

    function queueLiuBiaoAction(action) {
      if (!spendPoint('dip')) return;
      const names = { report: '上报桂阳局势', loyal: '表明忠心', supplies: '请求兵粮', conceal: '隐瞒扩张准备' };
      gameState.orders.push({
        id: uid(),
        type: 'liubiao',
        point: 'dip',
        label: '襄阳：' + (names[action] || action),
        payload: { action }
      });
      toast('已加入指令：襄阳 ' + (names[action] || action));
      saveToStorage(false);
      render();
    }

    function resolveLiuBiaoAction(order, reports) {
      const action = order.payload.action;
      const liuBiao = gameState.characters.liuBiao;
      const guiyang = gameState.cities.guiyang;
      const gentry = gameState.characters.jingnanGentry;
      gameState.storyFlags ||= {};
      gameState.storyFlags.liuBiaoLoyalActions ||= { report: 0, loyal: 0, supplies: 0, conceal: 0 };
      gameState.storyFlags.liuBiaoLoyalActions[action] = Number(gameState.storyFlags.liuBiaoLoyalActions[action] || 0) + 1;
      if (action === 'report') {
        liuBiao.trust = clamp(liuBiao.trust + 5, 0, 100);
        gameState.player.protection = clamp(gameState.player.protection + 4, 0, 100);
        gentry.suspicion = clamp(gentry.suspicion - 2, 0, 100);
        reports.push({ tone: 'good', text: '你向襄阳上报桂阳局势。刘表认可你的谨慎，庇护略有恢复。' });
      } else if (action === 'loyal') {
        liuBiao.trust = clamp(liuBiao.trust + 7, 0, 100);
        gameState.player.ambition = clamp(gameState.player.ambition - 2, 0, 100);
        gameState.player.protection = clamp(gameState.player.protection + 3, 0, 100);
        reports.push({ tone: 'good', text: '你向刘表表明忠心。襄阳对桂阳的疑虑暂缓。' });
      } else if (action === 'supplies') {
        guiyang.food += 700;
        guiyang.garrison.infantry += 100;
        liuBiao.trust = clamp(liuBiao.trust - 3, 0, 100);
        reports.push({ tone: 'warn', text: '襄阳拨来一批粮草与郡兵。刘表答应支援，也在等待你的治理成果。' });
      } else if (action === 'conceal') {
        gameState.player.ambition = clamp(gameState.player.ambition + 5, 0, 100);
        gameState.characters.retinue.network = clamp(gameState.characters.retinue.network + 4, 0, 100);
        applyProtectionDecay(8, '你刻意向襄阳隐瞒扩张准备', reports);
        reports.push({ tone: 'warn', text: '你选择隐瞒部分准备。亲信网络更深，刘表庇护却因此松动。' });
      }
    }

    function performYuanAction(action) {
      const y = gameState.characters.yuanShao;
      const r = gameState.characters.retinue;
      if (action === 'loyalVisit') {
        y.trust = clamp(y.trust + 8, 0, 100);
        y.alert = clamp(y.alert - 8, 0, 100);
        gameState.player.ambition = clamp(gameState.player.ambition - 3, 0, 100);
        addNews('good', gameState.player.name + '遣使入邺表忠，袁绍暂缓疑心。');
      } else if (action === 'audience') {
        if (gameState.player.prestige < 25) return toast('声望不足，袁绍不会轻易召见');
        gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + 10, 0, 100);
        y.alert = clamp(y.alert + 5, 0, 100);
        addNews('warn', '你请求入邺面见，顺势观察邺城守军与袁氏旧臣。');
      } else if (action === 'plantInside') {
        if (!spendPoint('inner')) return;
        gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + 18, 0, 100);
        y.alert = clamp(y.alert + 7, 0, 100);
        addNews('warn', '亲信被送入邺城粮道与宫门，暴露风险随之上升。');
      } else if (action === 'xuYouPlan') {
        gameState.characters.xuYou.favor = clamp(gameState.characters.xuYou.favor + 16, 0, 100);
        gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + 12, 0, 100);
        addNews('good', '许攸收下重礼，暗示邺城粮道与守将已有裂缝。');
      } else if (action === 'oldGuard') {
        gameState.player.legitimacy = clamp(gameState.player.legitimacy + 6, 0, 100);
        gameState.cities.yecheng.morale = clamp(gameState.cities.yecheng.morale - 6, 0, 100);
        y.alert = clamp(y.alert + 8, 0, 100);
        addNews('warn', '袁军旧部开始与黎阳互通消息，邺城军心微动。');
      } else if (action === 'prepareCoup') {
        r.coup = clamp(r.coup + 18, 0, 100);
        y.alert = clamp(y.alert + 9, 0, 100);
        addNews('warn', '宫门、粮道、令符的暗线被一一排定，逼宫之夜正在接近。');
      } else if (action === 'launchCoup') {
        launchCoup();
      } else if (action === 'rejectDisarm') {
        gameState.storyFlags.openConflict = true;
        y.status = '公开对抗';
        y.trust = clamp(y.trust - 30, 0, 100);
        y.alert = 100;
        addNews('bad', '你拒绝削权。袁绍与黎阳正式决裂，起兵攻邺已解锁。');
      } else if (action === 'attackYe') {
        openBattlePlanner('yecheng');
      }
      render();
    }

    function spendPoint(kind) {
      if (gameState.actionPoints[kind] <= 0) {
        toast('本回合' + pointName(kind) + '不足');
        return false;
      }
      gameState.actionPoints[kind] -= 1;
      return true;
    }

    function pointName(kind) {
      return { gov: '政务点', mil: '军令点', scheme: '谋略点', dip: '外交点', inner: '亲信点' }[kind] || '行动点';
    }

    function uid() {
      return Math.random().toString(36).slice(2, 10);
    }

    function simpleHash(str) {
      let hash = 5381;
      for (let index = 0; index < str.length; index += 1) {
        hash = ((hash << 5) + hash) + str.charCodeAt(index);
        hash &= hash;
      }
      return Math.abs(hash).toString(36);
    }

    function undoOrder() {
      const order = gameState.orders.pop();
      if (!order) return toast('没有可撤销的指令');
      if (order.point) gameState.actionPoints[order.point] += order.pointCost || 1;
      render();
    }

    function clearOrders() {
      gameState.orders.forEach(order => {
        if (order.point) gameState.actionPoints[order.point] += order.pointCost || 1;
      });
      gameState.orders = [];
      render();
    }

    function endTurn() {
      if (isGuideActive()) {
        return endGuideTurn();
      }
      if (gameState.pendingDefense) return toast('敌军来攻，必须先选择防守方针');
      if (gameState.activeModal) return toast('请先处理当前弹窗');
      const before = snapshotPlayerState();
      const reports = [];
      gameState.turnEvents = [];
      processCharacterDiscoveryTriggers(reports);
      processAppointmentAutoTasks(reports);
      processOrders(reports);
      unlockTabsByTutorialProgress();
      enforceBenevolentDefensiveCampaignRules(reports);
      advanceCampaigns(reports);
      if (checkDefeatEnding()) {
        reports.forEach(item => {
          addNews(item.tone, item.text);
          gameState.turnEvents.push({ id: uid(), turn: gameState.turn, level: item.level || 'important', tone: item.tone, text: item.text });
        });
        saveToStorage(false);
        render();
        toast('城池尽失，败局已定');
        return;
      }
      processEconomy(reports);
      processPublicSupportCrises(reports);
      processStoryPlague(reports);
      processSubmissionInstability(reports);
      processAllianceDiplomacy(reports);
      syncLiuBiaoProtectionWithPlayerAttacks(reports);
      runFactionAI(reports);
      runNpcWarAI(reports);
      processLiuBiaoBreakdown(reports);
      processPlotLines(reports);
      processStoryRedemptionOpportunities(reports);
      checkStoryTriggers(reports);
      evaluateSpecialEvents();
      evaluateNpcInitiatives();
      processCharacterDiscoveryTriggers(reports);
      unlockTabsByTutorialProgress();
      advanceDate(TURN_DAYS);
      gameState.turn += 1;
      gameState.orders = [];
      resetActionPoints();
      reports.forEach(item => {
        addNews(item.tone, item.text);
        gameState.turnEvents.push({ id: uid(), turn: gameState.turn - 1, level: item.level || 'important', tone: item.tone, text: item.text });
      });
      const summary = { turn: gameState.turn - 1, date: formatDate(), deltas: buildPlayerDeltas(before, snapshotPlayerState()), events: structuredClone(gameState.turnEvents) };
      gameState.turnSummaries.unshift(summary);
      gameState.turnSummaries = gameState.turnSummaries.slice(0, 18);
      gameState.pendingTurnSummary = summary;
      cleanupInvalidAppointments();
      normalizeAiContentCache();
      saveToStorage(false);
      gameState.lastAutoSave = Date.now();
      updateAutosaveDisplay();
      render();
      openNextCriticalModal();
      toast('第' + (gameState.turn - 1) + '回合已结算，请查看战报');
    }

    function processOrders(reports) {
      gameState.orders.forEach(order => {
        if (order.type === 'city') resolveCityOrder(order, reports);
        if (order.type === 'transfer') createMilitaryOrder(order, reports);
        if (order.type === 'battle') createMilitaryOrder(order, reports);
        if (order.type === 'military') resolveMilitaryOrder(order, reports);
        if (order.type === 'scheme') resolveScheme(order, reports);
        if (order.type === 'diplomacy') resolveDiplomacy(order, reports);
        if (order.type === 'liubiao') resolveLiuBiaoAction(order, reports);
        if (order.type === 'inner') resolveInner(order, reports);
      });
    }

    function processAppointmentAutoTasks(reports) {
      normalizeAppointments(gameState);
      const tasks = gameState.appointments?.autoTasks || {};
      Object.entries(tasks).forEach(([cityId, task]) => {
        if (task?.enabled !== true) return;
        const city = gameState.cities?.[cityId];
        if (!city || !isControlledBy(city.id, 'player')) return;
        const militaryOfficers = getCityOfficials(cityId, 'militaryOfficerId');
        if (!militaryOfficers.length) return;
        const capacity = getCityMilitaryOfficerLimit(city);
        let used = 0;
        if (task.militaryMode && task.militaryMode !== 'none' && used < capacity) {
          resolveCityOrder({ label: city.name + '：自动兵务', payload: { cityId, action: task.militaryMode } }, reports);
          used += 1;
        }
        const prepModes = getUniqueAutoTaskModes(task, 'militaryPrepModes', 'militaryPrepMode', MILITARY_PREP_MODE_LIST);
        prepModes.slice(0, Math.max(0, capacity - used)).forEach(mode => {
          if (resolveMilitaryOrder({ payload: { cityId, action: mode } }, reports)) used += 1;
        });
      });
    }

    function getSpecializedTrainingPlan(city, action) {
      const config = SPECIAL_TRAINING_ACTIONS[action];
      if (!city || !config) return null;
      const effects = getCityStrategicEffects(city);
      const multiplier = clamp(effects.training[config.effectKey] || 1, 0.55, 1.8);
      const base = city.population * (city.recruitBase || 0.014) * config.baseRate * (1 + city.level * 0.06);
      const amount = Math.max(40, Math.round(base * multiplier));
      const foodCost = Math.max(45, Math.round(amount * config.food));
      const moneyCost = Math.max(20, Math.round(amount * config.money));
      const moraleGain = clamp(2.2 + city.level * 0.35 + (multiplier - 1) * 4, 2, 8);
      return { ...config, amount, foodCost, moneyCost, moraleGain, multiplier, effects };
    }

    function resolveSpecializedTraining(city, action, reports, source = 'city') {
      const plan = getSpecializedTrainingPlan(city, action);
      if (!plan) return false;
      const foodRatio = city.food >= plan.foodCost ? 1 : clamp(city.food / Math.max(1, plan.foodCost), 0.25, 1);
      const moneyRatio = city.money >= plan.moneyCost ? 1 : clamp(city.money / Math.max(1, plan.moneyCost), 0.25, 1);
      const resourceRatio = Math.min(foodRatio, moneyRatio);
      const amount = Math.max(20, Math.round(plan.amount * resourceRatio));
      const foodSpent = Math.min(city.food, Math.round(plan.foodCost * resourceRatio));
      const moneySpent = Math.min(city.money, Math.round(plan.moneyCost * resourceRatio));
      city.food = Math.max(0, city.food - foodSpent);
      city.money = Math.max(0, city.money - moneySpent);
      city.garrison[plan.troopKind] = Math.max(0, Number(city.garrison[plan.troopKind] || 0) + amount);
      if (action === 'trainLand') city.garrison.archers = Math.max(0, Number(city.garrison.archers || 0) + Math.round(amount * 0.28));
      city.morale = clamp(city.morale + plan.moraleGain * resourceRatio, 0, 100);
      const tagText = plan.effects.tags.map(tag => tag.label).slice(0, 2).join('、') || '本地兵源';
      const weakText = resourceRatio < 0.75 ? '（资源不足，训练缩水）' : '';
      reports.push({
        tone: resourceRatio < 0.75 ? 'warn' : 'good',
        text: city.name + (source === 'auto' ? '自动' : '') + plan.label + '完成，新增' + plan.troopLabel + ' ' + fmt(amount) + (action === 'trainLand' ? '、弓手 ' + fmt(Math.round(amount * 0.28)) : '') + '，士气 +' + fmt(plan.moraleGain) + '，消耗粮 ' + fmt(foodSpent) + '、府库 ' + fmt(moneySpent) + '。' + tagText + '加成 ' + fmtPercent(plan.multiplier) + weakText
      });
      return true;
    }

    function openTrainingChoice(cityId) {
      const city = gameState.cities[cityId];
      if (!city || !isControlledBy(cityId, 'player')) return toast('只能在自己控制的城池练兵');
      gameState.activeModal = { type: 'trainingChoice', cityId };
      renderModal();
    }

    function chooseTrainingOrder(cityId, action) {
      if (!SPECIAL_TRAINING_ACTIONS[action]) return;
      gameState.activeModal = null;
      queueCityOrder(cityId, action);
    }

    function resolveCityOrder(order, reports) {
      const city = gameState.cities[order.payload.cityId];
      const action = order.payload.action;
      if (!city || !isControlledBy(city.id, 'player')) return;
      if (action === 'policy') {
        if (order.payload.domain === 'tax') city.taxRate = order.payload.rate ?? policyRateFromKey('tax', order.payload.value);
        if (order.payload.domain === 'grain') city.grainRate = order.payload.rate ?? policyRateFromKey('grain', order.payload.value);
        normalizeCityPolicy(city);
        reports.push({ tone: 'good', text: city.name + '改行' + order.label.split('改行')[1] + '。政策将在本回合经济结算中生效。' });
        return;
      }
      const eco = calculateCityEconomy(city);
      if (action === 'recruit') {
        const publicMod = getPublicSupportEconomyModifier(city);
        if (city.publicSupport <= 0) {
          reports.push({ tone: 'bad', level: 'critical', text: city.name + '民心已崩，强行征兵引发骚动。' });
          triggerPublicSupportCrisis(city, reports, { reason: 'forcedRecruit' });
          return;
        }
        const amount = Math.round(city.population * city.recruitBase * publicMod.recruit * (1 + city.level * 0.08));
        city.population = Math.max(8000, city.population - Math.round(amount * 1.4));
        city.garrison.infantry += Math.round(amount * 0.65);
        city.garrison.archers += Math.round(amount * 0.22);
        city.garrison.cavalry += Math.round(amount * 0.13);
        city.publicSupport = clamp(city.publicSupport - (city.publicSupport < 20 ? 10 : city.publicSupport < 40 ? 6 : 3), 0, 100);
        city.order = clamp(city.order - (city.publicSupport < 10 ? 5 : 1.5), 0, 100);
        reports.push({ tone: 'warn', text: city.name + '征得新兵 ' + fmt(amount) + '。人口和民心受损，守军增加。' });
      } else if (action === 'train') {
        const foodCost = Math.round(realTroops(city.garrison) * 0.42);
        const effect = city.food >= foodCost ? clamp(5 + city.morale / 28 + city.level, 3, 12) : 2;
        city.food = Math.max(0, city.food - foodCost);
        city.morale = clamp(city.morale + effect, 0, 100);
        reports.push({ tone: 'good', text: city.name + '练兵完成，士气 +' + Math.round(effect) + '，消耗粮草 ' + fmt(foodCost) + '。' });
      } else if (SPECIAL_TRAINING_ACTIONS[action]) {
        resolveSpecializedTraining(city, action, reports, 'city');
      } else if (action === 'fortify') {
        const cost = Math.round(130 + city.level * 90 + city.defense * 4);
        const labor = clamp((city.publicSupport + city.order) / 120, 0.45, 1.35);
        const effect = clamp(city.level * 1.4 * labor, 2, 9);
        city.money = Math.max(0, city.money - cost);
        city.defense = clamp(city.defense + effect, 0, 100);
        reports.push({ tone: 'good', text: city.name + '修城防，城防 +' + Math.round(effect) + '，府库支出 ' + fmt(cost) + '。' });
      } else if (action === 'tuntian') {
        const cost = Math.round(180 + city.population / 1000);
        city.money = Math.max(0, city.money - cost);
        city.agriculture = clamp(city.agriculture + clamp(city.publicSupport / 24, 1.2, 4.8), 0, 100);
        city.construction = '屯田';
        reports.push({ tone: 'good', text: city.name + '开屯田。短期耗费府库，长期粮食产能提高。' });
      } else if (action === 'relief') {
        const costFood = Math.round(city.population / 85);
        const shortage = eco.netFood < 0 ? 1.4 : 1;
        const effect = clamp((costFood / Math.max(600, city.population / 120)) * shortage + city.order / 45, 2, 9);
        city.food = Math.max(0, city.food - costFood);
        city.publicSupport = clamp(city.publicSupport + effect, 0, 100);
        city.order = clamp(city.order + effect * 0.45, 0, 100);
        reports.push({ tone: 'good', text: city.name + '赈济百姓，民心缓慢回升，粮草支出 ' + fmt(costFood) + '。' });
      } else if (action === 'security') {
        const cost = Math.round(90 + city.population / 1800);
        city.money = Math.max(0, city.money - cost);
        city.order = clamp(city.order + clamp(city.level + 4, 4, 10), 0, 100);
        city.publicSupport = clamp(city.publicSupport + 1.2, 0, 100);
        reports.push({ tone: 'good', text: city.name + '整顿治安，豪强私斗暂歇，商路恢复。' });
      }
    }

    function resolveMilitaryOrder(order, reports) {
      const city = gameState.cities[order.payload.cityId];
      const action = order.payload.action;
      if (!city || !isControlledBy(city.id, 'player')) {
        reports.push({ tone: 'bad', text: '军事整备失败：目标城池不存在或已失守。' });
        return false;
      }
      let success = false;
      if (action === 'drill') {
        if (city.food < 80) {
          reports.push({ tone: 'bad', text: city.name + '粮草不足，无法整军。' });
          return false;
        }
        city.food = Math.max(0, city.food - 80);
        city.morale = clamp(city.morale + 5, 0, 100);
        reports.push({ tone: 'good', text: city.name + '整军完成，士气 +5，消耗粮草 80。' });
        success = true;
      } else if (action === 'defense') {
        if (city.money < 80) {
          reports.push({ tone: 'bad', text: city.name + '府库不足，无法加固防线。' });
          return false;
        }
        city.money = Math.max(0, city.money - 80);
        city.defense = clamp(city.defense + 4, 0, 100);
        reports.push({ tone: 'good', text: city.name + '防线加固，城防 +4，府库支出 80。' });
        success = true;
      } else if (action === 'reserve') {
        city.defense = clamp(city.defense + 2, 0, 100);
        city.morale = clamp(city.morale + 2, 0, 100);
        city.reserveReady = true;
        reports.push({ tone: 'good', text: city.name + '预备队已部署，城防 +2、士气 +2，本城部分兵力转为防守预备。' });
        success = true;
      } else {
        reports.push({ tone: 'bad', text: '军事整备失败：未知指令。' });
        return false;
      }
      if (success) {
        completeFirstMilitaryOrderAfterResolved(action, reports);
      }
      return success;
    }

    function resolveTransfer(order, reports) {
      const source = gameState.cities[order.payload.source];
      const target = gameState.cities[order.payload.target];
      const amount = Math.min(order.payload.troops, Math.max(0, realTroops(source.garrison) - 250));
      if (amount <= 0) return;
      moveTroops(source.garrison, target.garrison, amount);
      const cost = Math.round(amount * 0.18);
      source.food = Math.max(0, source.food - cost);
      target.morale = clamp(target.morale + 1.4, 0, 100);
      reports.push({ tone: 'good', text: source.name + '调兵 ' + fmt(amount) + ' 至 ' + target.name + '，路上耗粮 ' + fmt(cost) + '。' });
    }

    function moveTroops(from, to, amount) {
      const total = Math.max(1, realTroops(from));
      TROOP_KINDS.forEach(kind => {
        const moved = Math.min(from[kind], Math.round(amount * from[kind] / total));
        from[kind] -= moved;
        to[kind] = Math.max(0, Number(to[kind] || 0) + moved);
      });
    }

    function resolveBattleOrder(order, reports) {
      const source = gameState.cities[order.payload.source];
      const target = gameState.cities[order.payload.target];
      if (!source || !target) return;
      const troops = Math.min(order.payload.troops, Math.max(0, realTroops(source.garrison) - 250));
      if (troops <= 0) return;
      const power = estimateBattlePower(order.payload, source, target);
      const roll = 0.86 + Math.random() * 0.28;
      const attackPower = power.attack * roll;
      const defendPower = power.defense * (0.9 + Math.random() * 0.22);
      const ratio = attackPower / Math.max(1, defendPower);
      const win = ratio >= 1.02;
      const heavyWin = ratio >= 1.35;
      const lossRate = win ? (heavyWin ? 0.13 : 0.22) : 0.34;
      const enemyLossRate = win ? (heavyWin ? 0.62 : 0.45) : 0.22;
      removeTroops(source.garrison, Math.round(troops * lossRate));
      removeTroops(target.garrison, Math.round(realTroops(target.garrison) * enemyLossRate));
      source.food = Math.max(0, source.food - Math.round(troops * 0.34));
      source.morale = clamp(source.morale + (win ? 4 : -6), 0, 100);
      target.morale = clamp(target.morale + (win ? -12 : 3), 0, 100);
      target.warDamage = clamp(target.warDamage + (win ? 18 : 9), 0, 100);
      if (win && order.payload.objective === 'capture') {
        const old = cityController(target.id);
        captureRegion(target.id, 'player', null, { prestige: heavyWin ? 9 : 6, alert: old === 'yuan' ? 22 : 12 });
        gameState.player.ambition = clamp(gameState.player.ambition + 5, 0, 100);
        const controlText = gameState.player.independent
          ? '归属势力改为' + gameState.player.name + '。'
          : '名义归属仍保留，实际控制已转入你手。';
        reports.push({ tone: 'good', text: '战报：' + source.name + '军攻取' + target.name + '。此城已由你实际控制，' + controlText });
        if (target.id === 'yecheng') takeYecheng(reports, 'battle');
      } else if (win) {
        target.morale = clamp(target.morale - 8, 0, 100);
        target.food = Math.max(0, target.food - Math.round(target.food * 0.18));
        reports.push({ tone: 'good', text: '战报：' + source.name + '军在' + target.name + '外得胜，敌军粮道被压制。' });
      } else {
        reports.push({ tone: 'bad', text: '战报：进攻' + target.name + '失利。兵力不是一切，地形、城防和粮道拖垮了攻势。' });
      }
      gameState.battleReports.unshift({ turn: gameState.turn, source: source.name, target: target.name, win, ratio: fmtPercent(ratio) });
    }

    function getPublicSupportBattleModifier(city) {
      const ps = Number(city.publicSupport || 0);
      if (ps <= 0) return { defenseMultiplier: 0.58, moralePenalty: 22, openGateChance: 0.32, intelligenceLeakChance: 0.45 };
      if (ps < 10) return { defenseMultiplier: 0.72, moralePenalty: 14, openGateChance: 0.18, intelligenceLeakChance: 0.28 };
      if (ps < 20) return { defenseMultiplier: 0.86, moralePenalty: 8, openGateChance: 0.08, intelligenceLeakChance: 0.16 };
      return { defenseMultiplier: 1, moralePenalty: 0, openGateChance: 0, intelligenceLeakChance: 0 };
    }

    function estimateBattlePower(draft, source, target) {
      const troops = Math.max(1, Number(draft.troops) || 1);
      const routeMods = { official: 1, river: 0.96, raid: 1.08, night: 1.03, cut: 0.9 };
      const tacticMods = { balanced: 1, assault: 1.08, siege: 0.96, feint: 1.04, reserve: 0.92 };
      const objectiveMods = { capture: 1, contain: 0.92, exhaust: 0.95, supply: 0.9 };
      const foodFactor = source.food > troops * 0.35 ? 1 : 0.78;
      const intelFactor = target.intel > 30 ? 1.08 : 1;
      const disruption = target.disrupted > 0 ? 1 + target.disrupted / 160 : 1;
      const sourceEffects = getCityStrategicEffects(source);
      const sourceGarrison = source.garrison || {};
      const garrisonTotal = Math.max(1, realTroops(sourceGarrison));
      const cavalryShare = Number(sourceGarrison.cavalry || 0) / garrisonTotal;
      const navyShare = Number(sourceGarrison.navy || 0) / garrisonTotal;
      const compositionMod = clamp(
        1
          + (draft.route === 'river' ? navyShare * 0.32 : 0)
          + (['raid', 'night'].includes(draft.route) ? cavalryShare * 0.22 : 0)
          + ((draft.route === 'official' || draft.tactic === 'balanced') ? Math.min(0.06, Number(sourceGarrison.infantry || 0) / garrisonTotal * 0.08) : 0),
        0.9,
        1.22
      );
      const cityRouteMod = sourceEffects.battle[draft.route] || 1;
      const attack = troops * (source.morale / 72) * routeMods[draft.route] * tacticMods[draft.tactic] * objectiveMods[draft.objective] * foodFactor * intelFactor * disruption * compositionMod * cityRouteMod;
      const defense = realTroops(target.garrison) * (0.65 + target.defense / 100) * (target.morale / 70) * (0.86 + target.publicSupport / 240) * getPublicSupportBattleModifier(target).defenseMultiplier;
      const ratio = attack / Math.max(1, defense);
      return {
        attack,
        defense,
        ratio,
        label: ratio >= 1.35 ? '优势明显' : ratio >= 1.05 ? '可战' : ratio >= 0.82 ? '胜负未定' : '风险极高'
      };
    }

    function removeTroops(garrison, amount) {
      const total = Math.max(1, realTroops(garrison));
      TROOP_KINDS.forEach(kind => {
        const loss = Math.min(garrison[kind], Math.round(amount * garrison[kind] / total));
        garrison[kind] -= loss;
      });
    }

    function resolveSpecialCharacterScheme(order, reports) {
      const character = gameState.characterRoster?.[order.payload.characterId];
      const city = gameState.cities[order.payload.targetId] || gameState.cities[gameState.player.startingCity || 'guiyang'];
      const scheme = String(order.payload.scheme || '');
      const state = specialSchemeUnlockState(character);
      if (!character || !scheme || !state.unlocked || !getCharacterSpecialSchemes(character).includes(scheme)) {
        reports.push({ tone: 'warn', text: '人物特殊谋略条件已变化，本次未能执行。' });
        return;
      }
      const r = gameState.characters.retinue;
      const profile = specialSchemeProfile(character, scheme);
      const stats = character.stats || {};
      const home = gameState.cities[gameState.player.startingCity || 'guiyang'];
      const fid = cityController(city.id);
      const chance = clamp(
        0.5
        + Number(character.stats?.strategy || 50) / 260
        + Number(character.trustPlayer || 0) / 320
        + Number(character.respectPlayer || 0) / 360
        + Number(r.network || 0) / 360
        - Number(city.order || 50) / 520,
        0.35,
        0.92
      );
      const success = Math.random() < chance;
      const force = (success ? 1 : 0.45) * profile.scale;
      const commandPower = Math.max(1, Math.round((Number(stats.command || 50) - 42) / 5 * force));
      const strategyPower = Math.max(1, Math.round((Number(stats.strategy || 50) - 42) / 5 * force));
      const politicsPower = Math.max(1, Math.round((Number(stats.politics || 50) - 42) / 5 * force));
      const charmPower = Math.max(1, Math.round((Number(stats.charm || 50) - 42) / 5 * force));
      const activeTargetCampaign = (gameState.campaigns || []).find(campaign => campaign.faction === 'player' && campaign.target === city.id && isActiveCampaign(campaign));
      const activeHomeCampaign = (gameState.campaigns || []).find(campaign => campaign.faction === 'player' && isActiveCampaign(campaign));
      let detail = '';

      if (profile.archetype === 'assault') {
        const moraleDrop = clamp(5 + commandPower + (profile.variant === '震慑' ? 4 : 0), 3, 22);
        const defenseDrop = profile.variant === '破阵' ? clamp(3 + Math.round(commandPower / 2), 2, 12) : 0;
        city.morale = clamp(city.morale - moraleDrop, 0, 100);
        city.disrupted = clamp((city.disrupted || 0) + clamp(8 + commandPower, 4, 28), 0, 100);
        if (defenseDrop) city.defense = clamp(city.defense - defenseDrop, 0, 100);
        detail = city.name + '士气 -' + moraleDrop + (defenseDrop ? '，城防 -' + defenseDrop : '') + '，混乱上升。';
      } else if (profile.archetype === 'command') {
        const moraleGain = clamp(3 + commandPower, 2, 16);
        home.morale = clamp(home.morale + moraleGain, 0, 100);
        if (activeHomeCampaign) {
          activeHomeCampaign.supply = Math.max(0, Number(activeHomeCampaign.supply || 0) + (success ? 2 : 1));
          activeHomeCampaign.commanderActionCooldown = Math.max(0, Number(activeHomeCampaign.commanderActionCooldown || 0) - 1);
        }
        detail = home.name + '军心 +' + moraleGain + (activeHomeCampaign ? '，进行中战役补给 +' + (success ? 2 : 1) : '') + '。';
      } else if (profile.archetype === 'defense') {
        const defenseGain = clamp(3 + commandPower, 2, 14);
        home.defense = clamp(home.defense + defenseGain, 0, 100);
        home.reserveReady = true;
        if (activeTargetCampaign && activeTargetCampaign.status === 'siege') activeTargetCampaign.siegeRemaining = Math.max(1, Number(activeTargetCampaign.siegeRemaining || 2) - 1);
        detail = home.name + '城防 +' + defenseGain + '，预备队进入戒备' + (activeTargetCampaign?.status === 'siege' ? '，围城压力被削弱' : '') + '。';
      } else if (profile.archetype === 'scheme') {
        const intelGain = clamp(10 + strategyPower * 2, 8, 42);
        const disruptGain = clamp(8 + strategyPower + (profile.variant === '设伏' ? 6 : 0), 4, 36);
        city.intel = clamp(city.intel + intelGain, 0, 100);
        city.disrupted = clamp((city.disrupted || 0) + disruptGain, 0, 100);
        city.morale = clamp(city.morale - clamp(2 + Math.round(strategyPower / 2), 1, 14), 0, 100);
        detail = city.name + '情报 +' + intelGain + '，混乱 +' + disruptGain + '，士气受挫。';
      } else if (profile.archetype === 'logistics') {
        const foodGain = Math.round((success ? 520 : 220) * profile.scale + politicsPower * 38);
        const moneyGain = Math.round((success ? 160 : 60) * profile.scale + charmPower * 16);
        home.food += foodGain;
        home.money += moneyGain;
        if (activeHomeCampaign && profile.variant === '补给') activeHomeCampaign.supply = Math.max(0, Number(activeHomeCampaign.supply || 0) + 2);
        detail = home.name + '粮草 +' + fmt(foodGain) + '，府库 +' + fmt(moneyGain) + (activeHomeCampaign && profile.variant === '补给' ? '，战役补给 +2' : '') + '。';
      } else if (profile.archetype === 'diplomacy') {
        if (!gameState.diplomacy[fid]) gameState.diplomacy[fid] = { relation: 30, pact: '未接触' };
        const relationGain = clamp(4 + charmPower + (profile.variant === '缓敌' ? 3 : 0), 2, 18);
        gameState.diplomacy[fid].relation = clamp(gameState.diplomacy[fid].relation + relationGain, 0, 100);
        gameState.player.legitimacy = clamp(gameState.player.legitimacy + (success ? 2 : 1), 0, 100);
        if (profile.variant === '正名') gameState.player.prestige = clamp(gameState.player.prestige + (success ? 3 : 1), 0, 100);
        detail = factionName(fid) + '关系 +' + relationGain + '，合法性提升。';
      } else if (profile.archetype === 'govern') {
        const supportGain = clamp(2 + politicsPower, 1, 13);
        const orderGain = clamp(2 + Math.round(politicsPower / 2), 1, 10);
        home.publicSupport = clamp(home.publicSupport + supportGain, 0, 100);
        home.order = clamp(home.order + orderGain, 0, 100);
        gameState.characters.jingnanGentry.suspicion = clamp(gameState.characters.jingnanGentry.suspicion - (success ? 4 : 1), 0, 100);
        detail = home.name + '民心 +' + supportGain + '，治安 +' + orderGain + '，士族疑心下降。';
      } else if (profile.archetype === 'talent') {
        const prestigeGain = clamp(2 + charmPower, 1, 12);
        const networkGain = clamp(4 + strategyPower, 2, 20);
        gameState.player.prestige = clamp(gameState.player.prestige + prestigeGain, 0, 100);
        r.network = clamp(r.network + networkGain, 0, 100);
        gameState.characters.jingnanGentry.trust = clamp(gameState.characters.jingnanGentry.trust + (success ? 3 : 1), 0, 100);
        detail = '声望 +' + prestigeGain + '，情报网络 +' + networkGain + '，荆南士族更愿意牵线。';
      } else if (profile.archetype === 'heal') {
        const moraleGain = clamp(2 + charmPower, 1, 12);
        const recovered = Math.round((success ? 90 : 35) * profile.scale + charmPower * 10);
        const plagueBefore = cityPlagueLevel(home.id);
        home.morale = clamp(home.morale + moraleGain, 0, 100);
        home.garrison.infantry = Math.max(0, Number(home.garrison.infantry || 0) + recovered);
        if (activeHomeCampaign) activeHomeCampaign.supply = Math.max(0, Number(activeHomeCampaign.supply || 0) + 1);
        if (isStoryMode() && plagueBefore > 0) {
          const plagueDrop = clamp(16 + charmPower + (success ? 12 : 2), 8, 42);
          setCityPlagueLevel(home.id, plagueBefore - plagueDrop);
        }
        detail = home.name + '士气 +' + moraleGain + '，伤兵归队 ' + fmt(recovered) + (plagueBefore > 0 ? '，疫病得到压制' : '') + '。';
      } else {
        const prestigeGain = clamp(1 + charmPower, 1, 10);
        const disruptGain = clamp(4 + strategyPower, 2, 20);
        gameState.player.prestige = clamp(gameState.player.prestige + prestigeGain, 0, 100);
        city.disrupted = clamp((city.disrupted || 0) + disruptGain, 0, 100);
        detail = '声望 +' + prestigeGain + '，' + city.name + '局势被牵动，混乱 +' + disruptGain + '。';
      }

      if (!success && profile.risk === '高') {
        city.intel = clamp(city.intel + 3, 0, 100);
        gameState.characters.retinue.network = clamp(gameState.characters.retinue.network + 1, 0, 100);
      }

      reports.push({
        tone: success ? 'good' : 'warn',
        text: character.name + '施展「' + scheme + '」' + (success ? '奏效' : '未尽全功') + '（' + profile.variant + '）：' + detail
      });
      addCharacterMemory(character, { summary: '执行特殊谋略「' + scheme + '」' + (success ? '奏效。' : '未尽全功。') });
    }

    function resolveScheme(order, reports) {
      if (order.payload.action === 'specialCharacterScheme') {
        resolveSpecialCharacterScheme(order, reports);
        return;
      }
      if (gameState.currentAct === 1 && gameState.storyFlags.jingnanOpening) {
        resolveJingnanScheme(order, reports);
        return;
      }
      const city = gameState.cities[order.payload.targetId] || gameState.cities.yecheng;
      const y = gameState.characters.yuanShao;
      const r = gameState.characters.retinue;
      const success = Math.random() < schemeChance(order.payload.action, city);
      if (order.payload.action === 'scout') {
        city.intel = clamp(city.intel + (success ? 32 : 12), 0, 100);
        reports.push({ tone: success ? 'good' : 'warn', text: (success ? '刺探成功：' : '刺探受阻：') + city.name + '守军、粮道与城防情报已更新。' });
      } else if (order.payload.action === 'cutSupply') {
        if (success) {
          city.food = Math.max(0, city.food - Math.round(city.food * 0.22));
          city.morale = clamp(city.morale - 9, 0, 100);
          city.disrupted = clamp(city.disrupted + 22, 0, 100);
          reports.push({ tone: 'good', text: city.name + '粮道被破坏，敌军士气和战斗力下降。' });
        } else {
          y.alert = clamp(y.alert + 8, 0, 100);
          reports.push({ tone: 'bad', text: '断粮行动失败，袁绍耳目抓住蛛丝马迹，警戒上升。' });
        }
      } else if (order.payload.action === 'innerGate') {
        if (success) {
          city.disrupted = clamp(city.disrupted + 28, 0, 100);
          if (city.id === 'yecheng') gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + 18, 0, 100);
          reports.push({ tone: 'good', text: city.name + '内应开始活动，未来破城概率大幅提高。' });
        } else {
          y.alert = clamp(y.alert + 10, 0, 100);
          reports.push({ tone: 'bad', text: '联络内应失败，亲信差点被捕。' });
        }
      } else if (order.payload.action === 'forgeOrder') {
        if (success) {
          city.morale = clamp(city.morale - 10, 0, 100);
          city.garrison.infantry = Math.max(0, city.garrison.infantry - 180);
          reports.push({ tone: 'good', text: '伪造军令奏效，' + city.name + '守军调动混乱。' });
        } else {
          y.alert = clamp(y.alert + 12, 0, 100);
          gameState.characters.guoTu.suspicion = clamp(gameState.characters.guoTu.suspicion + 8, 0, 100);
          reports.push({ tone: 'bad', text: '伪令被郭图党羽识破，袁绍开始追查源头。' });
        }
      } else if (order.payload.action === 'xuyou') {
        gameState.characters.xuYou.favor = clamp(gameState.characters.xuYou.favor + (success ? 18 : 8), 0, 100);
        gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + (success ? 16 : 5), 0, 100);
        reports.push({ tone: 'good', text: '许攸索贿之后吐露邺城粮道虚实。' });
      } else if (order.payload.action === 'caoPact') {
        gameState.diplomacy.cao.relation = clamp(gameState.diplomacy.cao.relation + 14, 0, 100);
        gameState.characters.caoCao.threat = clamp(gameState.characters.caoCao.threat + 8, 0, 100);
        y.alert = clamp(y.alert + 8, 0, 100);
        applyProtectionDecay(8, '你与外部势力暗通款曲', reports);
        reports.push({ tone: 'warn', text: '许昌回信：曹操愿意在反袁时牵制袁军，但他的刀也不会只向袁绍。' });
      } else if (order.payload.action === 'yuanRumor') {
        y.authority = clamp(y.authority - (success ? 10 : 3), 0, 100);
        y.alert = clamp(y.alert + (success ? 5 : 11), 0, 100);
        reports.push({ tone: success ? 'good' : 'bad', text: success ? '袁绍失德流言在邺城扩散，旧臣离心。' : '流言被压下，袁绍疑心更重。' });
      }
      r.network = clamp(r.network + 2, 0, 100);
    }

    function resolveJingnanScheme(order, reports) {
      const city = gameState.cities[order.payload.targetId] || gameState.cities.guiyang;
      const r = gameState.characters.retinue;
      const clans = gameState.characters.guiyangClans;
      const success = Math.random() < schemeChance(order.payload.action, city);
      if (order.payload.action === 'scout') {
        city.intel = clamp(city.intel + (success ? 30 : 12), 0, 100);
        r.network = clamp(r.network + (success ? 4 : 1), 0, 100);
        reports.push({ tone: success ? 'good' : 'warn', text: (success ? '刺探成功：' : '刺探受阻：') + city.name + '的豪强往来与粮道情报已更新。' });
      } else if (order.payload.action === 'cutSupply') {
        city.disrupted = clamp(city.disrupted + (success ? 18 : 5), 0, 100);
        reports.push({ tone: success ? 'good' : 'warn', text: success ? city.name + '地方势力的粮道被压制。' : '破坏粮道未能奏效，地方耳目开始提高警觉。' });
      } else if (order.payload.action === 'innerGate') {
        r.gate = clamp(r.gate + (success ? 12 : 4), 0, 100);
        reports.push({ tone: success ? 'good' : 'warn', text: success ? city.name + '的郡吏愿意暗中递送消息。' : '联络郡吏受阻，暂时没有可靠回应。' });
      } else if (order.payload.action === 'forgeOrder') {
        clans.suspicion = clamp(clans.suspicion + (success ? -6 : 5), 0, 100);
        reports.push({ tone: success ? 'good' : 'warn', text: success ? '疑阵奏效，豪强暂时摸不清你的真实部署。' : '疑阵被识破，豪强对府衙更为戒备。' });
      }
      r.network = clamp(r.network + 2, 0, 100);
    }

    function schemeChance(action, city) {
      const r = gameState.characters.retinue;
      const base = {
        scout: 0.76,
        cutSupply: 0.56,
        innerGate: 0.46,
        forgeOrder: 0.48,
        xuyou: 0.68,
        caoPact: 0.72,
        yuanRumor: 0.52
      }[action] || 0.55;
      return clamp(base + r.network / 260 + city.intel / 300 - city.order / 360, 0.18, 0.88);
    }

    function resolveDiplomacy(order, reports) {
      const action = order.payload.action;
      const target = order.payload.target;
      if (action === 'allyLiu') {
        gameState.diplomacy.liu.relation = clamp(gameState.diplomacy.liu.relation + 18, 0, 100);
        gameState.player.legitimacy = clamp(gameState.player.legitimacy + 4, 0, 100);
        reports.push({ tone: 'good', text: '刘备遣人回礼。小沛兵少，但他的名望可以为你增添合法性。' });
      } else if (action === 'useGongsun') {
        gameState.diplomacy.gongsun.relation = clamp(gameState.diplomacy.gongsun.relation + 14, 0, 100);
        gameState.characters.yuanShao.authority = clamp(gameState.characters.yuanShao.authority - 5, 0, 100);
        reports.push({ tone: 'warn', text: '公孙瓒愿意在北线牵制袁绍，幽燕压力上升。' });
      } else if (action === 'caoFood') {
        const city = gameState.cities[gameState.player.startingCity || 'guiyang'];
        city.food += 900;
        gameState.diplomacy.cao.relation = clamp(gameState.diplomacy.cao.relation + 10, 0, 100);
        gameState.characters.yuanShao.alert = clamp(gameState.characters.yuanShao.alert + 9, 0, 100);
        applyProtectionDecay(10, '你绕过襄阳向曹操借粮', reports);
        reports.push({ tone: 'warn', text: '曹操暗送粮草入' + city.name + '，解了燃眉之急，也埋下反噬。' });
      } else if (action === 'appeaseLocal') {
        const city = gameState.cities[target];
        if (city && canAppeaseLocalPower(city)) {
          const controller = cityController(city.id);
          const opportunity = getLocalDefectionOpportunity(city.id);
          const collapseBonus = Number(city.publicSupport || 0) <= 0 ? 38 : Number(city.publicSupport || 0) < 12 ? 24 : 0;
          const unrestBonus = clamp((35 - Number(city.order || 0)) * 0.7, 0, 18);
          const localBonus = controller === 'local' ? 14 : 0;
          const networkBonus = clamp(Number(gameState.characters?.retinue?.network || 0) / 4, 0, 18);
          const score = Number(gameState.player.prestige || 0) + Number(gameState.player.legitimacy || 0) + networkBonus + collapseBonus + unrestBonus + localBonus + (opportunity ? 18 : 0);
          const threshold = controller === 'local' ? 58 : 78;
          const chance = clamp((score - threshold + 36) / 72, 0.18, opportunity || Number(city.publicSupport || 0) <= 0 ? 0.88 : 0.62);
          if (score >= threshold || Math.random() < chance) {
            const oldController = controller;
            captureRegion(city.id, 'player', null, { prestige: oldController === 'local' ? 4 : 6, alert: oldController === 'yuan' ? 16 : 10 });
            city.publicSupport = clamp(Math.max(Number(city.publicSupport || 0), 42) + (oldController === 'local' ? 6 : 2), 0, 100);
            city.order = clamp(Number(city.order || 0) + 8, 0, 100);
            if (gameState.publicUnrestState?.localDefectionOpportunities) delete gameState.publicUnrestState.localDefectionOpportunities[city.id];
            reports.push({ tone: 'good', text: city.name + '地方豪强接受招安，旧主民心尽失，城中实际听你调度。' });
          } else {
            reports.push({ tone: 'warn', text: city.name + '豪强虽已动摇，但仍在观望。提高声望、合法性或亲信情报网可增加成功率。' });
          }
        } else {
          reports.push({ tone: 'warn', text: '招安未成。当地民心尚未崩坏，豪强仍不敢背离旧主。' });
        }
      } else if (action === 'demandFood') {
        const city = gameState.cities[target];
        if (city && !isControlledBy(city.id, 'player')) {
          const food = Math.round(city.food * 0.12);
          city.food -= food;
          gameState.cities[gameState.player.startingCity || 'guiyang'].food += food;
          city.publicSupport = clamp(city.publicSupport - 3, 0, 100);
          gameState.player.fear = clamp(gameState.player.fear + 3, 0, 100);
          applyProtectionDecay(4, '你强令周边势力纳粮，地方民怨上升', reports);
          reports.push({ tone: 'warn', text: city.name + '被迫纳粮 ' + fmt(food) + '，你的威慑上升，民怨也在积累。' });
        }
      } else if (action === 'autonomy') {
        const city = gameState.cities[target];
        if (city && cityController(city.id) === 'local') {
          captureRegion(city.id, 'player', null, { prestige: 3, alert: 7 });
          city.publicSupport = clamp(city.publicSupport + 8, 0, 100);
          city.garrison.infantry = Math.round(city.garrison.infantry * 0.72);
          reports.push({ tone: 'good', text: city.name + '以自治换归附。此城兵权较弱，但民心稳定。' });
        }
      } else if (action === 'lobby') {
        const targetCity = gameState.cities[target];
        const fid = targetCity ? cityController(targetCity.id) : (target || 'local');
        if (!gameState.diplomacy[fid]) gameState.diplomacy[fid] = { relation: 30, pact: '未接触' };
        if (gameState.diplomacy[fid]) {
          gameState.diplomacy[fid].relation = clamp(gameState.diplomacy[fid].relation + 9, 0, 100);
          reports.push({ tone: 'good', text: '使者往来，' + FACTIONS[fid].name + '对你的态度有所缓和。' });
        }
      }
    }

    function resolveInner(order, reports) {
      if (gameState.currentAct === 1 && gameState.storyFlags.jingnanOpening) {
        resolveJingnanInner(order, reports);
        return;
      }
      const r = gameState.characters.retinue;
      const y = gameState.characters.yuanShao;
      if (order.payload.action === 'organize') {
        r.loyalty = clamp(r.loyalty + 8, 0, 100);
        gameState.cities.liyang.morale = clamp(gameState.cities.liyang.morale + 4, 0, 100);
        reports.push({ tone: 'good', text: '亲兵营整肃完成，军令更能直达基层。' });
      } else if (order.payload.action === 'campGate') {
        r.coup = clamp(r.coup + 8, 0, 100);
        y.alert = clamp(y.alert + 5, 0, 100);
        reports.push({ tone: 'warn', text: '营门亲信被换上要害岗位，袁绍耳目有所察觉。' });
      } else if (order.payload.action === 'spyYecheng') {
        r.network = clamp(r.network + 10, 0, 100);
        gameState.storyFlags.yechengInside = clamp(gameState.storyFlags.yechengInside + 12, 0, 100);
        reports.push({ tone: 'good', text: '邺城兵册和粮道暗线被摸清，内应进度提高。' });
      } else if (order.payload.action === 'buyOfficer') {
        r.network = clamp(r.network + 5, 0, 100);
        r.gate = clamp(r.gate + 12, 0, 100);
        y.alert = clamp(y.alert + 6, 0, 100);
        reports.push({ tone: 'good', text: '几名袁军小校被收买，未来夺门机会增加。' });
      } else if (order.payload.action === 'grainRoute') {
        gameState.cities.liyang.food += 520;
        r.coup = clamp(r.coup + 6, 0, 100);
        y.alert = clamp(y.alert + 8, 0, 100);
        reports.push({ tone: 'warn', text: '亲信接管部分粮道，黎阳粮草增加，袁绍警戒上升。' });
      } else if (order.payload.action === 'prepareCoup') {
        if (r.network < 35) reports.push({ tone: 'warn', text: '情报网络不足，逼宫准备推进缓慢。' });
        r.coup = clamp(r.coup + (r.network >= 35 ? 20 : 9), 0, 100);
        y.alert = clamp(y.alert + 10, 0, 100);
      } else if (order.payload.action === 'gateRaid') {
        if (gameState.storyFlags.yechengInside < 45) reports.push({ tone: 'warn', text: '邺城内应不足，夺门行动只能先做预案。' });
        r.gate = clamp(r.gate + (gameState.storyFlags.yechengInside >= 45 ? 22 : 8), 0, 100);
        y.alert = clamp(y.alert + 12, 0, 100);
        reports.push({ tone: 'warn', text: '夺门行动预案成形。若攻邺，可显著削弱城防。' });
      }
    }

    function resolveJingnanInner(order, reports) {
      const r = gameState.characters.retinue;
      const guiyang = gameState.cities.guiyang;
      if (order.payload.action === 'organize') {
        r.loyalty = clamp(r.loyalty + 8, 0, 100);
        guiyang.morale = clamp(guiyang.morale + 4, 0, 100);
        reports.push({ tone: 'good', text: '桂阳亲兵整肃完成，府中号令更能直达基层。' });
      } else if (order.payload.action === 'campGate') {
        r.coup = clamp(r.coup + 9, 0, 100);
        reports.push({ tone: 'good', text: '主簿将可靠人手安插进府衙要害，文书与令符更可控。' });
      } else if (order.payload.action === 'buyOfficer') {
        r.gate = clamp(r.gate + 11, 0, 100);
        guiyang.morale = clamp(guiyang.morale + 2, 0, 100);
        reports.push({ tone: 'good', text: '亲兵统领联络郡兵小校，桂阳军令逐渐顺畅。' });
      } else if (order.payload.action === 'grainRoute') {
        guiyang.food += 520;
        r.network = clamp(r.network + 4, 0, 100);
        reports.push({ tone: 'good', text: '粮官重新梳理桂阳粮道，府库收到一批可用军粮。' });
      } else if (order.payload.action === 'prepareCoup') {
        r.network = clamp(r.network + 7, 0, 100);
        r.coup = clamp(r.coup + 5, 0, 100);
        reports.push({ tone: 'warn', text: '亲信班底开始建立隐秘联络网。力量更稳，但不宜过早张扬。' });
      }
    }

    function getPublicUnrestLevel(city) {
      const ps = Number(city.publicSupport || 0);
      if (ps <= 0) return 'collapse';
      if (ps < 10) return 'explosive';
      if (ps < 20) return 'danger';
      if (ps < 35) return 'unstable';
      return 'stable';
    }

    function getNeighborEnemyFactions(cityId) {
      const controller = cityController(cityId);
      return [...new Set(cityNeighborIds(cityId).map(id => cityController(id)).filter(id => id && id !== controller))];
    }

    function ensurePublicUnrestState() {
      gameState.publicUnrestState ||= {
        lastCrisisTurnByCity: {},
        rebellionCities: {},
        intelligenceLeaks: [],
        localDefectionOpportunities: {}
      };
      gameState.publicUnrestState.lastCrisisTurnByCity ||= {};
      gameState.publicUnrestState.rebellionCities ||= {};
      gameState.publicUnrestState.intelligenceLeaks ||= [];
      gameState.publicUnrestState.localDefectionOpportunities ||= {};
      return gameState.publicUnrestState;
    }

    function markLocalDefectionOpportunity(city, reports, context = {}) {
      if (!city || cityController(city.id) === 'player') return null;
      const unrest = ensurePublicUnrestState();
      const existing = unrest.localDefectionOpportunities[city.id];
      const controller = cityController(city.id);
      const opportunity = {
        turn: gameState.turn,
        expiresTurn: gameState.turn + Number(context.duration || 8),
        controller,
        reason: context.reason || 'publicCollapse',
        support: Math.round(Number(city.publicSupport || 0)),
        order: Math.round(Number(city.order || 0))
      };
      unrest.localDefectionOpportunities[city.id] = opportunity;
      if ((!existing || Number(existing.turn || 0) !== gameState.turn) && cityReachDistance(city.id) <= 3) {
        reports.push({
          tone: 'warn',
          level: 'important',
          text: city.name + '民心崩溃，地方豪强开始寻找新靠山。此时更容易通过外交招安获取城池。'
        });
      }
      return opportunity;
    }

    function getLocalDefectionOpportunity(cityId) {
      const opportunity = gameState.publicUnrestState?.localDefectionOpportunities?.[cityId];
      if (!opportunity) return null;
      if (gameState.turn > Number(opportunity.expiresTurn || 0)) {
        delete gameState.publicUnrestState.localDefectionOpportunities[cityId];
        return null;
      }
      return opportunity;
    }

    function canAppeaseLocalPower(city) {
      if (!city || isControlledBy(city.id, 'player')) return false;
      const controller = cityController(city.id);
      if (controller === 'local') return true;
      return Number(city.publicSupport || 0) <= 12 || Number(city.order || 0) <= 18 || Boolean(getLocalDefectionOpportunity(city.id));
    }

    function triggerIntelligenceLeak(city, reports, options = {}) {
      const leakTarget = options.toFaction || getNeighborEnemyFactions(city.id)[0] || null;
      city.morale = clamp(city.morale - 6, 0, 100);
      city.defense = clamp(city.defense - 4, 0, 100);
      gameState.publicUnrestState.intelligenceLeaks.push({ turn: gameState.turn, cityId: city.id, toFaction: leakTarget, expiresTurn: gameState.turn + 4 });
      if (options.toFaction) {
        reports.push({ tone: 'warn', text: city.name + '城防虚实被' + factionName(options.toFaction) + '军探查，守备情报外泄。' });
      } else {
        reports.push({ tone: 'warn', text: city.name + '民怨四起，城防、粮道与守军虚实流入外部势力。' });
      }
    }

    function triggerCityUprising(city, reports) {
      city.order = clamp(city.order - 18, 0, 100);
      city.morale = clamp(city.morale - 16, 0, 100);
      city.food = Math.max(0, city.food - Math.round(city.food * 0.18));
      city.money = Math.max(0, city.money - Math.round(city.money * 0.12));
      city.warDamage = clamp((city.warDamage || 0) + 12, 0, 100);
      const rebelTroops = Math.round(clamp(city.population * 0.012, 300, 1800));
      removeTroops(city.garrison, Math.round(realTroops(city.garrison) * 0.12));
      gameState.publicUnrestState.rebellionCities[city.id] = { turn: gameState.turn, rebelTroops, severity: 'high', progress: 0, suppressed: false };
      reports.push({ tone: 'bad', level: 'critical', text: city.name + '民怨爆发，乡民与豪强聚众作乱，城中守军受损。' });
      if (cityController(city.id) === 'player') addUrgentMatter({ type: 'uprising', cityId: city.id, title: city.name + '爆发民变', text: '民心归零引发起义。若不赈济或整顿，城池可能失控。' });
    }

    function triggerLocalDefectionRisk(city, reports) {
      city.order = clamp(city.order - 10, 0, 100);
      city.morale = clamp(city.morale - 12, 0, 100);
      city.defense = clamp(city.defense - 8, 0, 100);
      if (cityController(city.id) !== 'player') {
        removeTroops(city.garrison, Math.round(realTroops(city.garrison) * 0.08));
        markLocalDefectionOpportunity(city, reports, { reason: 'localDefectionRisk', duration: 8 });
      }
      reports.push({ tone: 'bad', level: 'critical', text: city.name + '地方豪强离心，守军倒戈风险急升。' });
    }

    function markPublicCrisisTriggered(cityId) {
      ensurePublicUnrestState();
      gameState.publicUnrestState.lastCrisisTurnByCity[cityId] = gameState.turn;
    }

    function triggerPublicSupportCrisis(city, reports, context = {}) {
      const ps = Number(city.publicSupport || 0);
      const isPlayerCity = cityController(city.id) === 'player';
      let triggered = false;
      if (ps <= 0) {
        const roll = Math.random();
        if (isPlayerCity && roll < 0.35) triggerCityUprising(city, reports, context);
        else if (roll < (isPlayerCity ? 0.62 : 0.5)) triggerIntelligenceLeak(city, reports, context);
        else triggerLocalDefectionRisk(city, reports, context);
        if (!isPlayerCity) markLocalDefectionOpportunity(city, reports, { reason: context.reason || 'publicCollapse', duration: 8 });
        triggered = true;
      } else if (ps < 10) {
        city.food = Math.max(0, city.food - Math.round(city.food * 0.12));
        city.money = Math.max(0, city.money - Math.round(city.money * 0.08));
        city.order = clamp(city.order - 6, 0, 100);
        reports.push({ tone: 'bad', text: city.name + '民怨沸腾，粮仓与府库受扰，治安急降。' });
        triggered = true;
      } else if (ps < 20) {
        city.food = Math.max(0, city.food - Math.round(city.food * 0.06));
        city.order = clamp(city.order - 3, 0, 100);
        reports.push({ tone: 'warn', text: city.name + '民怨积压，百姓逃散，粮产受损。' });
        triggered = true;
      }
      if (triggered) markPublicCrisisTriggered(city.id);
      return triggered;
    }

    function processPublicSupportCrises(reports) {
      const unrest = ensurePublicUnrestState();
      Object.entries(unrest.localDefectionOpportunities || {}).forEach(([cityId, opportunity]) => {
        if (gameState.turn > Number(opportunity?.expiresTurn || 0)) delete unrest.localDefectionOpportunities[cityId];
      });
      let triggeredCount = 0;
      Object.values(gameState.cities || {}).forEach(city => {
        if (triggeredCount >= 3) return;
        if (isRemovedCityId(city.id)) return;
        const level = getPublicUnrestLevel(city);
        if (level === 'stable') return;
        const last = unrest.lastCrisisTurnByCity[city.id] ?? -99;
        if (gameState.turn - last < 3) return;
        const playerCity = cityController(city.id) === 'player';
        const chanceTable = playerCity
          ? { unstable: 0.08, danger: 0.18, explosive: 0.34, collapse: 0.65 }
          : { unstable: 0.025, danger: 0.07, explosive: 0.14, collapse: 0.28 };
        const chance = chanceTable[level];
        if (Math.random() < chance) {
          const triggered = triggerPublicSupportCrisis(city, reports, { reason: level });
          if (triggered) triggeredCount += 1;
        }
      });
    }

    function processEconomy(reports) {
      Object.values(gameState.cities).filter(city => !isRemovedCityId(city.id)).forEach(city => {
        const eco = calculateCityEconomy(city);
        city.food = Math.max(0, city.food + eco.netFood);
        city.money = Math.max(0, city.money + eco.taxIncome - eco.grainCost);
        const isNpcCity = cityController(city.id) !== 'player' && FACTIONS[cityController(city.id)];
        const npcStable = isNpcCity && applyNpcNormalStability(city, eco);
        if (!npcStable) {
          applyEconomicPublicSupportDelta(city, eco);
          city.order = clamp(city.order + eco.orderDelta, 0, 100);
        }
        city.agriculture = clamp(city.agriculture + (eco.growth - 1) * 0.45 - city.warDamage * 0.006, 0, 100);
        city.commerce = clamp(city.commerce + (eco.commerceFactor - 1) * 0.55 - city.warDamage * 0.008, 0, 100);
        city.warDamage = clamp(city.warDamage - 3, 0, 100);
        processNpcCityRecruitment(city, eco, reports);
        if (city.publicSupport <= 0 && cityController(city.id) !== 'player') {
          city.order = clamp(Number(city.order || 0) - 3, 0, 100);
          city.morale = clamp(Number(city.morale || 0) - 3, 0, 100);
          city.defense = clamp(Number(city.defense || 0) - 2, 0, 100);
          removeTroops(city.garrison, Math.round(realTroops(city.garrison) * 0.04));
          markLocalDefectionOpportunity(city, reports, { reason: 'publicCollapse', duration: 8 });
        }
        if (city.food <= 0 && !npcStable) {
          city.morale = clamp(city.morale - 7, 0, 100);
          city.publicSupport = clamp(city.publicSupport - (Number(city.publicSupport || 0) < 35 ? 1.5 : 2.5), 0, 100);
          if (isControlledBy(city.id, 'player')) reports.push({ tone: 'bad', text: city.name + '缺粮，军心与民心同步下降。' });
        }
        if (city.publicSupport < 25 && city.order < 35 && !npcStable && Math.random() < 0.18) {
          city.garrison.infantry = Math.max(0, city.garrison.infantry - 120);
          reports.push({ tone: 'bad', text: city.name + '民怨爆发，逃亡与小规模叛乱削弱守军。' });
        }
        if (city.publicSupport < 10 && city.grainRate >= 85 && Math.random() < 0.22) {
          triggerPublicSupportCrisis(city, reports, { reason: 'forcedGrainLevy' });
        }
      });
      const guiyang = gameState.cities.guiyang;
      if (isControlledBy('guiyang', 'player') && guiyang.order < 32) {
        applyProtectionDecay(guiyang.order < 20 ? 8 : 5, '桂阳治安崩坏，刘表开始质疑你的治理能力', reports);
      }
      if (controlledCities().some(city => city.grainRate >= 85)) {
        applyProtectionDecay(4, '强征军粮引发民怨，荆南士族向襄阳告状', reports);
      }
    }

    function runFactionAI(reports) {
      if (gameState.currentAct === 1 && gameState.storyFlags.jingnanOpening) {
        runJingnanAI(reports);
        return;
      }
      const y = gameState.characters.yuanShao;
      const cao = gameState.characters.caoCao;
      const playerPower = controlledCities().length * 14 + gameState.player.prestige + cityTotals().troops / 500;
      if (playerPower > 58) y.alert = clamp(y.alert + 4, 0, 100);
      if (y.alert >= 62 && !gameState.storyFlags.yuanDisarm) {
        gameState.storyFlags.yuanDisarm = true;
        reports.push({ tone: 'bad', text: '袁绍调兵令抵达：要求你交出黎阳部分兵权。可在"袁绍"面板选择表忠、拒绝或起兵。' });
      }
      if (y.alert >= 84 && !gameState.storyFlags.openConflict && Math.random() < protectedNpcChance('npcAttack', 0.35)) {
        createNpcCampaign({ faction: 'yuan', source: 'yecheng', target: 'liyang', troops: 2800 }, reports);
      }
      if (gameState.turn % 3 === 0 && cityController('pingyuan') === 'local') {
        if (Math.random() < 0.5) {
          captureRegion('pingyuan', 'gongsun', null, { select: false });
          reports.push({ tone: 'warn', text: '公孙瓒军压平原，地方豪强转投幽燕。袁绍北线受牵制。' });
          y.authority = clamp(y.authority - 4, 0, 100);
        }
      }
      if (gameState.turn % 2 === 0) {
        cao.threat = clamp(cao.threat + 3, 0, 100);
        if (isControlledBy('baima', 'player') && Math.random() < protectedNpcChance('npcAttack', 0.22)) {
          createNpcCampaign({ faction: 'cao', source: 'guandu', target: 'baima', troops: 2100 }, reports);
        } else {
          reports.push({ tone: 'warn', text: '曹操稳固许昌与官渡，斥候开始测绘黄河渡口。' });
        }
      }
      if (Math.random() < 0.18) {
        const localCities = Object.values(gameState.cities).filter(c => !isRemovedCityId(c.id) && cityController(c.id) === 'local' && cityReachDistance(c.id) <= 3);
        const city = localCities[Math.floor(Math.random() * localCities.length)];
        if (city) reports.push({ tone: 'warn', text: city.name + '地方豪强观望局势，可能倒向强者。' });
      }
    }

    function runJingnanAI(reports) {
      const clans = gameState.characters.guiyangClans;
      const gentry = gameState.characters.jingnanGentry;
      const guiyang = gameState.cities.guiyang;
      runProtectedNpcPressure(reports);
      if (gameState.turn % 3 === 0) {
        clans.suspicion = clamp(clans.suspicion + 3, 0, 100);
        gentry.suspicion = clamp(gentry.suspicion + 2, 0, 100);
        reports.push({ tone: 'warn', text: '桂阳豪强与荆南士族仍在观望你的根基。治安、粮草和态度都会影响他们的选择。' });
      }
      if (gentry.suspicion >= 72 && gameState.turn % 2 === 0) {
        applyProtectionDecay(4, '蔡瑁与荆南士族对你疑心渐重', reports);
      }
      if (gameState.characters.liuBiao.authority < 55 && gameState.turn % 3 === 0) {
        applyProtectionDecay(5, '荆州权威下降，刘表的背书不再像从前有力', reports);
      }
      if (guiyang.order >= 66 && guiyang.publicSupport >= 64) {
        clans.suspicion = clamp(clans.suspicion - 2, 0, 100);
        gentry.trust = clamp(gentry.trust + 2, 0, 100);
      }
    }

    function runProtectedNpcPressure(reports) {
      const guiyang = gameState.cities.guiyang;
      const clans = gameState.characters.guiyangClans;
      const gentry = gameState.characters.jingnanGentry;
      const attackChance = protectedNpcChance('npcAttack', 0.12);
      const schemeChance = protectedNpcChance('scheme', 0.16);
      const assassinationChance = protectedNpcChance('assassination', 0.08);
      const persuadeChance = protectedNpcChance('persuade', 0.12);
      if (Math.random() < attackChance) {
        guiyang.order = clamp(guiyang.order - 4, 0, 100);
        guiyang.morale = clamp(guiyang.morale - 2, 0, 100);
        reports.push({ tone: 'bad', text: '地方豪强纵容部曲袭扰桂阳商路。刘表庇护仍在，但有人开始试探你的边界。' });
      }
      if (Math.random() < schemeChance) {
        gentry.suspicion = clamp(gentry.suspicion + 5, 0, 100);
        guiyang.publicSupport = clamp(guiyang.publicSupport - 2, 0, 100);
        reports.push({ tone: 'warn', text: '郡中出现针对你的流言，地方士族的观望情绪加重。' });
      }
      if (gameState.turn >= 3 && Math.random() < assassinationChance) {
        gameState.characters.retinue.loyalty = clamp(gameState.characters.retinue.loyalty - 3, 0, 100);
        reports.push({ tone: 'bad', text: '亲兵截获一场针对你的伏击。刺客未能得手，但府中戒备更紧。' });
      }
      if (Math.random() < persuadeChance) {
        clans.influence = clamp(clans.influence + 3, 0, 100);
        guiyang.publicSupport = clamp(guiyang.publicSupport - 1.5, 0, 100);
        reports.push({ tone: 'warn', text: '豪强私下游说乡里，不愿桂阳税粮完全听命于新任主官。' });
      }
    }

    function resolveDefense(choice) {
      const def = gameState.pendingDefense;
      if (!def) return;
      const target = gameState.cities[def.target];
      const source = gameState.cities[def.source];
      const modifiers = {
        hold: { atk: 0.95, def: 1.22, public: 0, label: '固守城池' },
        field: { atk: 1.12, def: 0.95, public: 0, label: '出城迎战' },
        scorched: { atk: 0.82, def: 1.12, public: -5, label: '坚壁清野' },
        nightRaid: { atk: 0.76, def: 1.08 + gameState.characters.retinue.network / 180, public: 0, label: '夜袭敌营' },
        retreat: { atk: 0.65, def: 0.75, public: -7, label: '撤退保存实力' },
        fakeSurrender: { atk: 0.7, def: 1.22 + gameState.characters.retinue.network / 220, public: -1, label: '假降诱敌' }
      }[choice];
      const enemyPower = def.troops * modifiers.atk * (0.9 + Math.random() * 0.25);
      const defensePower = realTroops(target.garrison) * (0.75 + target.defense / 100) * (target.morale / 70) * modifiers.def * (0.9 + Math.random() * 0.25);
      const hold = defensePower >= enemyPower;
      target.publicSupport = clamp(target.publicSupport + modifiers.public, 0, 100);
      if (hold) {
        removeTroops(target.garrison, Math.round(realTroops(target.garrison) * 0.12));
        target.morale = clamp(target.morale + 4, 0, 100);
        addNews('good', target.name + '防守成功：' + modifiers.label + '击退来敌。');
      } else if (choice === 'retreat') {
        removeTroops(target.garrison, Math.round(realTroops(target.garrison) * 0.08));
        target.morale = clamp(target.morale - 7, 0, 100);
        addNews('warn', target.name + '主动收缩守备，保存主力但城外据点丢失。');
      } else {
        removeTroops(target.garrison, Math.round(realTroops(target.garrison) * 0.28));
        target.morale = clamp(target.morale - 12, 0, 100);
        if (enemyPower > defensePower * 1.4) {
          captureRegion(target.id, def.faction, null);
          addNews('bad', target.name + '失守，敌军夺取城池。');
        } else {
          addNews('bad', target.name + '守住城池但损失惨重。');
        }
      }
      gameState.pendingDefense = null;
      render();
    }

    function checkStoryTriggers(reports) {
      if (gameState.currentAct === 1 && gameState.storyFlags.jingnanOpening) return;
      const y = gameState.characters.yuanShao;
      const playerCities = controlledCities().map(c => c.id);
      if (playerCities.includes('baima') && !gameState.storyFlags.baimaLesson) {
        gameState.storyFlags.baimaLesson = true;
        reports.push({ tone: 'good', text: '白马入手，你第一次真正理解：名义归属与实际控制是两回事。' });
      }
      if ((playerCities.includes('baima') && playerCities.includes('dongjun')) || playerCities.includes('pingyuan')) {
        y.alert = clamp(y.alert + 5, 0, 100);
        y.authority = clamp(y.authority - 3, 0, 100);
      }
      if (y.alert >= 72 && y.status === '仍掌河北') y.status = '准备削权';
      if (gameState.currentAct === 1 && isControlledBy('yecheng', 'player')) {
        takeYecheng(reports, 'control');
      }
    }

    function takeYecheng(reports, method) {
      if (gameState.storyFlags.northernActUnlocked) return;
      gameState.storyFlags.northernActUnlocked = true;
      gameState.currentAct = 2;
      gameState.currentGoal = '稳定河北，处理袁氏余党，选择联曹、抗曹或先灭公孙瓒。';
      gameState.player.title = '河北新主';
      gameState.player.independent = true;
      captureRegion('yecheng', 'player', null);
      gameState.characters.yuanShao.status = method === 'coup' ? '被迫退位' : '兵败失权';
      gameState.characters.yuanShao.authority = 0;
      reports.push({ tone: 'good', text: '河北夺袁篇结束：邺城已落入你手。游戏进入第二篇"北方霸权篇"，袁氏余党与曹操威胁仍未消失。' });
    }

    function launchCoup() {
      const y = gameState.characters.yuanShao;
      const r = gameState.characters.retinue;
      const score = gameState.storyFlags.yechengInside + r.coup + r.gate + gameState.player.prestige + gameState.player.legitimacy - y.authority;
      if (score < 145) return toast('逼宫准备不足');
      captureRegion('yecheng', 'player', null);
      gameState.player.prestige = clamp(gameState.player.prestige + 12, 0, 100);
      gameState.player.legitimacy = clamp(gameState.player.legitimacy + 8, 0, 100);
      const reports = [];
      takeYecheng(reports, 'coup');
      reports.forEach(item => addNews(item.tone, item.text));
      render();
    }

    function openBattlePlanner(targetId, preferredSourceId, preferredRoute = 'official') {
      if (!canAttackCity(targetId)) return toast('无法进攻此目标');
      let sourceId = preferredSourceId;
      // 如果指定了 preferredSourceId，验证路线可用
      if (sourceId && findCampaignRoute(sourceId, targetId, preferredRoute)) {
        // 优先使用传入的 sourceId
      } else {
        sourceId = null;
      }
      // fallback 到自动选择
      if (!sourceId) sourceId = getCampaignSource(targetId);
      if (!sourceId) return toast('没有通往目标的可用出兵路线');
      const source = gameState.cities[sourceId];
      gameState.draftBattle = {
        source: sourceId,
        target: targetId,
        troops: Math.min(1200, Math.max(300, realTroops(source.garrison) - 300)),
        route: preferredRoute || 'official',
        tactic: 'balanced',
        objective: 'capture'
      };
      gameState.activePanel = 'military';
      render();
    }

    function getAttackSource(targetId) {
      return getCampaignSource(targetId);
    }

    function getAttackableTargetsFrom(sourceId, routeMode = 'official') {
      const source = gameState.cities[sourceId];
      if (!source || !isControlledBy(sourceId, 'player')) return [];
      return Object.values(gameState.cities)
        .filter(city => !isRemovedCityId(city.id) && city.id !== sourceId && !isControlledBy(city.id, 'player'))
        .map(city => {
          const route = findCampaignRoute(sourceId, city.id, routeMode);
          if (!route) return null;
          const eta = calculateTravelTurns(route, { troops: 500, supply: 6 });
          return { city, route, eta: Math.round(eta), distance: Math.round(route.distance) };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance || a.eta - b.eta);
    }

    function getMilitaryPlannerSourceId() {
      const planner = gameState.militaryPlanner || {};
      if (planner.sourceId && isControlledBy(planner.sourceId, 'player') && realTroops(gameState.cities[planner.sourceId]?.garrison || troops(0,0,0,0)) > 100) {
        return planner.sourceId;
      }
      const sel = gameState.cities[gameState.selectedCityId];
      if (sel && isControlledBy(sel.id, 'player') && realTroops(sel.garrison) > 100) return sel.id;
      const controlled = controlledCities();
      const withTroops = controlled.filter(c => realTroops(c.garrison) > 100);
      return withTroops.length ? withTroops[0].id : (controlled.length ? controlled[0].id : null);
    }

    function getMilitaryPlannerTargetId(sourceId, targets) {
      const planner = gameState.militaryPlanner || {};
      if (planner.targetId && targets.some(t => t.city.id === planner.targetId)) return planner.targetId;
      if (targets.length) {
        const firstId = targets[0].city.id;
        gameState.militaryPlanner = gameState.militaryPlanner || {};
        gameState.militaryPlanner.targetId = firstId;
        return firstId;
      }
      return null;
    }

    function normalizeMilitaryPlannerSelection() {
      const planner = gameState.militaryPlanner;
      if (!planner) return;
      if (!planner.sourceId || !isControlledBy(planner.sourceId, 'player') || realTroops(gameState.cities[planner.sourceId]?.garrison || troops(0,0,0,0)) <= 100) {
        planner.sourceId = getMilitaryPlannerSourceId();
      }
      if (planner.sourceId) {
        const targets = getAttackableTargetsFrom(planner.sourceId, planner.route || 'official');
        if (!planner.targetId || !targets.some(t => t.city.id === planner.targetId)) {
          planner.targetId = targets.length ? targets[0].city.id : null;
        }
      }
    }

    function resetMilitaryPlanner() {
      gameState.militaryPlanner = { sourceId: null, targetId: null, route: 'official' };
    }

    function getCampaignSource(targetId) {
      const target = gameState.cities[targetId];
      if (!target || isControlledBy(targetId, 'player')) return null;
      const sources = controlledCities()
        .filter(city => realTroops(city.garrison) > 450)
        .map(city => ({ city, route: findCampaignRoute(city.id, targetId, 'official') }))
        .filter(item => item.route);
      if (!sources.length) return null;
      sources.sort((a, b) => a.route.distance - b.route.distance || realTroops(b.city.garrison) - realTroops(a.city.garrison));
      return sources[0].city.id;
    }

    function battleRouteName(route) {
      return { official: '正面官道', river: '沿河推进', raid: '绕路奇袭', night: '夜袭', cut: '断粮道' }[route] || route;
    }

    function battleTacticName(tactic) {
      return { balanced: '稳扎稳打', assault: '强攻夺城', siege: '围城断粮', feint: '佯攻诱敌', reserve: '预备队' }[tactic] || tactic;
    }

    function battleObjectiveName(objective) {
      return { capture: '夺城', contain: '牵制', exhaust: '消耗守军', supply: '切断粮道' }[objective] || objective;
    }

    function addNews(tone, text) {
      gameState.newsFeed.unshift({ tone, text: escapeHtml(text) });
      gameState.newsFeed = gameState.newsFeed.slice(0, 12);
    }

    function advanceDate(days) {
      gameState.date.day += days;
      while (gameState.date.day > 30) {
        gameState.date.day -= 30;
        gameState.date.month += 1;
      }
      while (gameState.date.month > 12) {
        gameState.date.month -= 12;
        gameState.date.year += 1;
      }
    }

    function focusMap(mode) {
      if (mode === 'fit') {
        gameState.mapState = { zoom: 1, panX: 0, panY: 0 };
      } else if (mode === 'jingzhou') {
        setMapFocusOn(810, 840, 1.65);
      } else if (mode === 'guiyang') {
        const center = getRegion('guiyang')?.center || gameState.cities.guiyang;
        setMapFocusOn(center.x, center.y, 2.9);
        gameState.selectedCityId = 'guiyang';
      } else if (mode === 'zoomIn') {
        zoomMapAtCenter(0.28);
      } else if (mode === 'zoomOut') {
        zoomMapAtCenter(-0.28);
      }
      render();
    }

    function clampMapZoom(zoom) {
      const numericZoom = Number(zoom);
      return clamp(Number.isFinite(numericZoom) ? numericZoom : MIN_MAP_ZOOM, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
    }

    function normalizeMapState(mapState = gameState.mapState) {
      const nextMapState = (mapState && typeof mapState === 'object') ? mapState : { zoom: MIN_MAP_ZOOM, panX: 0, panY: 0 };
      nextMapState.zoom = clampMapZoom(nextMapState.zoom);
      nextMapState.panX = Number.isFinite(Number(nextMapState.panX)) ? Number(nextMapState.panX) : 0;
      nextMapState.panY = Number.isFinite(Number(nextMapState.panY)) ? Number(nextMapState.panY) : 0;
      return nextMapState;
    }

    function clampMapTransform() {
      const svg = document.getElementById('mapStage');
      if (!svg || !gameState?.mapState) return;
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox?.baseVal;
      const viewportWidth = viewBox?.width || rect.width || MAP_SIZE.width;
      const viewportHeight = viewBox?.height || rect.height || MAP_SIZE.height;
      const mapWidth = MAP_SIZE.width * gameState.mapState.zoom;
      const mapHeight = MAP_SIZE.height * gameState.mapState.zoom;
      if (mapWidth > viewportWidth) {
        gameState.mapState.panX = clamp(gameState.mapState.panX, viewportWidth - mapWidth, 0);
      } else {
        gameState.mapState.panX = (viewportWidth - mapWidth) / 2;
      }
      if (mapHeight > viewportHeight) {
        gameState.mapState.panY = clamp(gameState.mapState.panY, viewportHeight - mapHeight, 0);
      } else {
        gameState.mapState.panY = (viewportHeight - mapHeight) / 2;
      }
    }

    function normalizeMapView() {
      gameState.mapState = normalizeMapState(gameState.mapState);
      clampMapTransform();
    }

    function setMapFocusOn(x, y, zoom) {
      gameState.mapState.zoom = clampMapZoom(zoom);
      gameState.mapState.panX = MAP_SIZE.width / 2 - x * gameState.mapState.zoom;
      gameState.mapState.panY = MAP_SIZE.height / 2 - y * gameState.mapState.zoom;
      normalizeMapView();
    }

    function focusMapOnCity(cityId) {
      const center = getRegion(cityId)?.center || gameState.cities[cityId];
      if (center) {
        setMapFocusOn(center.x, center.y, 2.9);
        render();
      }
    }

    function clientToSvgPoint(clientX, clientY) {
      const svg = document.getElementById('mapStage');
      if (svg.createSVGPoint && svg.getScreenCTM()) {
        const point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
      }
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (MAP_SIZE.width / rect.width),
        y: (clientY - rect.top) * (MAP_SIZE.height / rect.height)
      };
    }

    function svgPointToWorld(point) {
      return {
        x: (point.x - gameState.mapState.panX) / gameState.mapState.zoom,
        y: (point.y - gameState.mapState.panY) / gameState.mapState.zoom
      };
    }

    function pointInPolygon(point, polygon) {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0];
        const yi = polygon[i][1];
        const xj = polygon[j][0];
        const yj = polygon[j][1];
        const intersects = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || 0.00001) + xi);
        if (intersects) inside = !inside;
      }
      return inside;
    }

    function regionAtPoint(point) {
      return visibleRegions().find(region => pointInPolygon(point, region.polygon));
    }

    function selectRegionForCalibration(regionId) {
      if (!getRegion(regionId)) return;
      calibrationState.selectedRegionId = regionId;
      gameState.selectedCityId = regionId;
      gameState.activePanel = 'city';
      render();
    }

    function handleCalibrationMapClick(event) {
      const point = svgPointToWorld(clientToSvgPoint(event.clientX, event.clientY));
      calibrationState.lastPoint = point;
      if (event.shiftKey && calibrationState.selectedRegionId) {
        const region = getRegion(calibrationState.selectedRegionId);
        region.polygon.push([Math.round(point.x), Math.round(point.y)]);
        toast('已为' + region.name + '添加顶点：' + Math.round(point.x) + ',' + Math.round(point.y));
        renderMap();
        return true;
      }
      const targetId = event.target.closest('[data-select-city]')?.getAttribute('data-select-city');
      const region = targetId ? getRegion(targetId) : regionAtPoint(point);
      if (region) {
        selectRegionForCalibration(region.id);
        toast('校准选择：' + region.name + ' x:' + Math.round(point.x) + ' y:' + Math.round(point.y));
        return true;
      }
      renderMap();
      toast('坐标 x:' + Math.round(point.x) + ' y:' + Math.round(point.y));
      return true;
    }

    function selectNearestCityFromMapEvent(event) {
      if (suppressNextMapClick) return false;
      const point = svgPointToWorld(clientToSvgPoint(event.clientX, event.clientY));
      const region = regionAtPoint(point);
      if (region) {
        selectCity(region.id, 'city');
        return true;
      }
      let best = null;
      visibleRegions().forEach(mapRegion => {
        const city = gameState.cities[mapRegion.id];
        const dx = point.x - mapRegion.center.x;
        const dy = point.y - mapRegion.center.y;
        const domain = city?.domain || 44;
        const normalized = Math.sqrt((dx * dx) / Math.pow(domain * 1.28, 2) + (dy * dy) / Math.pow(domain * 0.92, 2));
        const direct = Math.sqrt(dx * dx + dy * dy);
        const score = Math.min(normalized, direct / 52);
        if (!best || score < best.score) best = { id: mapRegion.id, score };
      });
      if (!best || best.score > 1.05) return false;
      selectCity(best.id, 'city');
      return true;
    }

    function zoomMapAt(clientX, clientY, deltaZoom) {
      const oldZoom = gameState.mapState.zoom;
      const newZoom = clampMapZoom(oldZoom + deltaZoom);
      if (newZoom === oldZoom) {
        normalizeMapView();
        return;
      }
      const point = clientToSvgPoint(clientX, clientY);
      const worldX = (point.x - gameState.mapState.panX) / oldZoom;
      const worldY = (point.y - gameState.mapState.panY) / oldZoom;
      gameState.mapState.zoom = newZoom;
      gameState.mapState.panX = point.x - worldX * newZoom;
      gameState.mapState.panY = point.y - worldY * newZoom;
      normalizeMapView();
    }

    function zoomMapAtCenter(deltaZoom) {
      const svg = document.getElementById('mapStage');
      const rect = svg.getBoundingClientRect();
      zoomMapAt(rect.left + rect.width / 2, rect.top + rect.height / 2, deltaZoom);
    }

    function validateNpcLetterConsequences(characterId) {
      const npc = gameState.characterRoster ? gameState.characterRoster[characterId] : null;
      if (!npc) { console.warn('NPC not found:', characterId); return null; }
      // Deep clone backup
      const backup = {
        trustPlayer: npc.trustPlayer,
        suspicionOfPlayer: npc.suspicionOfPlayer,
        fearPlayer: npc.fearPlayer,
        respectPlayer: npc.respectPlayer,
        memory: npc.memory.slice(),
        npcAgency: JSON.parse(JSON.stringify(npc.npcAgency || {})),
        currentPlan: npc.currentPlan
      };
      const choices = ['accept', 'refuse', 'threaten', 'ignore'];
      const results = [];
      const testLetter = { id: 'test_letter', senderId: characterId, fromCharacterId: characterId, title: '测试来信', body: '这是一封测试信。', kind: '', meta: {}, choices: [] };
      for (const choiceId of choices) {
        // Restore backup
        npc.trustPlayer = backup.trustPlayer;
        npc.suspicionOfPlayer = backup.suspicionOfPlayer;
        npc.fearPlayer = backup.fearPlayer;
        npc.respectPlayer = backup.respectPlayer;
        npc.memory = backup.memory.slice();
        npc.npcAgency = JSON.parse(JSON.stringify(backup.npcAgency));
        npc.currentPlan = backup.currentPlan;
        const before = { trust: npc.trustPlayer, suspicion: npc.suspicionOfPlayer, fear: npc.fearPlayer, respect: npc.respectPlayer, memoryCount: npc.memory.length };
        const reports = [];
        resolveNpcLetterChoice(testLetter, choiceId, reports);
        const after = { trust: npc.trustPlayer, suspicion: npc.suspicionOfPlayer, fear: npc.fearPlayer, respect: npc.respectPlayer, memoryCount: npc.memory.length };
        results.push({
          choiceId,
          before,
          after,
          delta: {
            trust: after.trust - before.trust,
            suspicion: after.suspicion - before.suspicion,
            fear: after.fear - before.fear,
            respect: after.respect - before.respect
          },
          memoryAdded: after.memoryCount - before.memoryCount,
          stance: npc.npcAgency.relationshipStance,
          desire: npc.npcAgency.currentDesire,
          reports
        });
      }
      // Final restore
      npc.trustPlayer = backup.trustPlayer;
      npc.suspicionOfPlayer = backup.suspicionOfPlayer;
      npc.fearPlayer = backup.fearPlayer;
      npc.respectPlayer = backup.respectPlayer;
      npc.memory = backup.memory;
      npc.npcAgency = backup.npcAgency;
      npc.currentPlan = backup.currentPlan;
      updateNpcAttitudeToPlayer(npc);
      updateNpcRelationshipStance(npc);
      console.log('=== validateNpcLetterConsequences: ' + npc.name + ' ===');
      console.table(results);
      return results;
    }
    window.validateNpcLetterConsequences = validateNpcLetterConsequences;

    function validateNpcPlans() {
      const result = Object.values(gameState.characterRoster || {}).filter(isExternalCharacter).map(npc => ({
        id: npc.id,
        name: npc.name,
        trust: npc.trustPlayer,
        suspicion: npc.suspicionOfPlayer,
        fear: npc.fearPlayer,
        respect: npc.respectPlayer,
        stance: npc.npcAgency ? npc.npcAgency.relationshipStance : 'missing',
        desire: npc.npcAgency ? npc.npcAgency.currentDesire : 'missing',
        shortTermPlan: npc.npcAgency ? npc.npcAgency.shortTermPlan : 'missing',
        memoryCount: npc.memory ? npc.memory.length : 0,
        hasAgency: !!npc.npcAgency
      }));
      console.log('=== validateNpcPlans ===');
      console.table(result);
      return result;
    }
    window.validateNpcPlans = validateNpcPlans;

    function validateConversationAgency(characterId) {
      if (characterId && isInternalPlayerCharacterId(characterId)) {
        console.warn('内部班底不是外部 NPC，不参与会谈验证。');
        return [];
      }
      const targets = characterId
        ? [gameState.characterRoster[characterId]].filter(Boolean)
        : Object.values(gameState.characterRoster || {}).filter(npc => isExternalCharacter(npc) && npc.npcAgency);
      if (!targets.length) {
        console.warn('validateConversationAgency: 未找到有效 NPC 或 NPC 缺少 npcAgency。');
        return [];
      }
      const convTypes = ['gift', 'threaten', 'promiseOffice', 'strategy'];
      const results = [];

      // ---- 辅助：深拷贝 NPC 做备份/恢复 ----
      const backupNpc = (npc) => {
        const bk = {};
        const keys = [
          'trustPlayer', 'respectPlayer', 'fearPlayer', 'suspicionOfPlayer',
          'attitudeToPlayer', 'status', 'faction', 'recruitedBy', 'currentPlan',
          'stats', 'memory', 'npcAgency'
        ];
        keys.forEach(k => { bk[k] = structuredClone(npc[k]); });
        return bk;
      };
      const restoreNpc = (npc, bk) => {
        Object.keys(bk).forEach(k => { npc[k] = bk[k]; });
      };

      targets.forEach(npc => {
        const npcBackup = backupNpc(npc);

        // 记录对话前的 key state（方便前后对比）
        const before = {
          trust: npc.trustPlayer,
          suspicion: npc.suspicionOfPlayer,
          fear: npc.fearPlayer,
          respect: npc.respectPlayer,
          stance: npc.npcAgency ? npc.npcAgency.relationshipStance : 'missing',
          desire: npc.npcAgency ? npc.npcAgency.currentDesire : 'missing',
          hasUnresolvedPromise: !!(npc.npcAgency && npc.npcAgency.unresolvedPromise),
          hasGrievance: !!(npc.npcAgency && npc.npcAgency.grievance),
          hasFavor: !!(npc.npcAgency && npc.npcAgency.favor)
        };

        convTypes.forEach(ct => {
          // ---- 为每个 convType 独立测试：先恢复备份再执行 ----
          restoreNpc(npc, npcBackup);

          const action = CONVERSATION_ACTIONS[ct];
          if (!action) return;

          // 构造 applyConversationResult 所需的最小 context / dialogue
          const context = { npc, conversationType: ct };
          const dialogue = {
            memorySummary: ct + '（验证测试）',
            emotionalShift: action.label
          };

          // ---- 真实调用 ----
          const realEffects = applyConversationResult(context, dialogue);

          // ---- 收集写入结果 ----
          const after = {
            trust: npc.trustPlayer,
            suspicion: npc.suspicionOfPlayer,
            fear: npc.fearPlayer,
            respect: npc.respectPlayer,
            stance: npc.npcAgency ? npc.npcAgency.relationshipStance : 'missing',
            desire: npc.npcAgency ? npc.npcAgency.currentDesire : 'missing',
            hasUnresolvedPromise: !!(npc.npcAgency && npc.npcAgency.unresolvedPromise),
            hasGrievance: !!(npc.npcAgency && npc.npcAgency.grievance),
            hasFavor: !!(npc.npcAgency && npc.npcAgency.favor)
          };

          // 自动检查预期的 agency 字段
          const checks = {};
          const pass = (key, condition) => { checks[key] = { expected: true, actual: !!condition, passed: !!condition }; };
          const failIf = (key, condition) => { checks[key] = { expected: false, actual: !!condition, passed: !condition }; };

          pass('favorWritten', ct === 'gift' ? after.hasFavor : true);
          pass('grievanceWritten', ct === 'threaten' ? after.hasGrievance : true);
          pass('unresolvedPromiseWritten', ct === 'promiseOffice' ? after.hasUnresolvedPromise : true);
          pass('currentDesireUpdated', ct === 'strategy' ? after.desire !== before.desire : true);

          failIf('noSpuriousFavor', ct !== 'gift' && after.hasFavor);
          failIf('noSpuriousGrievance', ct !== 'threaten' && after.hasGrievance);
          failIf('noSpuriousPromise', ct !== 'promiseOffice' && after.hasUnresolvedPromise);

          const allPassed = Object.values(checks).every(c => c.passed);
          const failedKeys = Object.entries(checks).filter(([, c]) => !c.passed).map(([k]) => k);

          results.push({
            id: npc.id,
            name: npc.name,
            conversationType: ct,
            actionLabel: action.label,
            trustBefore: before.trust,
            trustAfter: after.trust,
            suspicionAfter: after.suspicion,
            fearAfter: after.fear,
            respectAfter: after.respect,
            stanceBefore: before.stance,
            stanceAfter: after.stance,
            desireBefore: before.desire,
            desireAfter: after.desire,
            favorBefore: before.hasFavor,
            favorAfter: after.hasFavor,
            grievanceBefore: before.hasGrievance,
            grievanceAfter: after.hasGrievance,
            promiseBefore: before.hasUnresolvedPromise,
            promiseAfter: after.hasUnresolvedPromise,
            realEffects: realEffects,
            checks,
            allPassed,
            failedKeys
          });
        });

        // ---- 最终恢复，不污染存档 ----
        restoreNpc(npc, npcBackup);
      });

      console.log('=== validateConversationAgency (真实测试，已自动恢复) ===');
      console.log('对话前 NPC 基准状态：');
      console.table(targets.map(npc => ({
        id: npc.id,
        name: npc.name,
        trust: npc.trustPlayer,
        suspicion: npc.suspicionOfPlayer,
        fear: npc.fearPlayer,
        respect: npc.respectPlayer,
        stance: npc.npcAgency ? npc.npcAgency.relationshipStance : 'missing',
        desire: npc.npcAgency ? npc.npcAgency.currentDesire : 'missing'
      })));
      console.log('各对话类型真实写入结果：');
      console.table(results.map(r => ({
        name: r.name,
        type: r.conversationType,
        label: r.actionLabel,
        trustDelta: r.trustAfter - r.trustBefore,
        stance: r.stanceBefore + '→' + r.stanceAfter,
        desire: r.desireAfter,
        favor: r.favorBefore + '→' + r.favorAfter,
        grievance: r.grievanceBefore + '→' + r.grievanceAfter,
        promise: r.promiseBefore + '→' + r.promiseAfter,
        passed: r.allPassed ? '✅' : '❌ ' + r.failedKeys.join(',')
      })));

      const totalPassed = results.filter(r => r.allPassed).length;
      const total = results.length;
      console.log('校验结果：' + totalPassed + '/' + total + ' 通过' + (totalPassed < total ? '，失败项：' + results.filter(r => !r.allPassed).map(r => r.name + '.' + r.conversationType + ' [' + r.failedKeys.join(',') + ']').join('；') : ''));
      console.log('所有 NPC 已恢复到测试前状态，存档未被污染。');
      return results;
    }
    window.validateConversationAgency = validateConversationAgency;

    function validateNoInternalPlayerCharactersInCharacterTab() {
      const visible = typeof visibleCharacters === 'function' ? visibleCharacters() : [];
      const internal = [...INTERNAL_PLAYER_CHARACTER_IDS];

      const result = {
        internalIds: internal,
        visibleInternalCharacters: visible
          .filter(character => isInternalPlayerCharacterId(character.id))
          .map(character => character.id + ':' + character.name),

        selectedIsInternal: isInternalPlayerCharacterId(gameState.selectedCharacterId),

        conversationsWithInternal: (gameState.conversations || []).filter(item =>
          [item.characterId, item.npcId, item.senderId, item.targetId].some(isInternalPlayerCharacterId)
        ).length,

        lettersFromInternal: (gameState.letters || []).filter(letter => {
          const senderId = letter.senderId || letter.fromCharacterId || letter.fromId || letter.sender || letter.characterId || letter.meta?.characterId;
          return letter.kind === 'npcInitiative' && isInternalPlayerCharacterId(senderId);
        }).length,

        initiativeRecentInternal: (gameState.npcInitiativeState?.recent || [])
          .filter(item => isInternalPlayerCharacterId(typeof item === 'string' ? item : item?.characterId)),

        rosterInternalExists: internal.filter(id => !!gameState.characterRoster?.[id])
      };

      console.table(result);
      return result;
    }

    window.validateNoInternalPlayerCharactersInCharacterTab = validateNoInternalPlayerCharactersInCharacterTab;

    function saveToStorage(show = false) {
      try {
        const json = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, json);
        const verify = localStorage.getItem(SAVE_KEY);
        if (!verify || verify.length === 0) {
          if (show) toast('保存失败：存储空间可能已满');
          return false;
        }
        localStorage.setItem(SAVE_KEY_BACKUP, json);
        localStorage.setItem(SAVE_KEY + ':lastSavedAt', String(Date.now()));
        if (show) toast('进度已保存');
        return true;
      } catch (e) {
        console.error('保存失败:', e);
        if (show) toast('保存失败：' + (e.message || '未知错误'));
        return false;
      }
    }

    function legacyLoadFromStorage(show = false) {
      try {
        let raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
          raw = localStorage.getItem(SAVE_KEY_BACKUP);
          if (raw && show) toast('主存档缺失，已从备份恢复');
        }
        if (!raw) {
          if (show) toast('没有找到存档');
          console.warn('No local save found. key:', SAVE_KEY);
          return null;
        }
        const loaded = JSON.parse(raw);
        if (!sanitizeLoadedData(loaded)) {
          const backup = localStorage.getItem(SAVE_KEY_BACKUP);
          if (backup) {
            try {
              const backupLoaded = JSON.parse(backup);
              if (sanitizeLoadedData(backupLoaded)) {
                if (show) toast('主存档损坏，已从备份恢复');
                return normalizeLoaded(backupLoaded);
              }
            } catch (_) { /* 备份也损坏，继续回退 */ }
          }
          if (show) toast('存档数据异常，已回退为初始状态');
          return createInitialState();
        }
        if (show) toast('进度已读取');
        const normalized = normalizeLoaded(loaded);
        console.log('Local save loaded:', {
          key: SAVE_KEY,
          turn: normalized.turn,
          player: normalized.player?.name,
          savedAt: localStorage.getItem(SAVE_KEY + ':lastSavedAt')
        });
        return normalized;
      } catch (error) {
        console.error('Local save is damaged or could not be loaded:', error);
        const backup = localStorage.getItem(SAVE_KEY_BACKUP);
        if (backup) {
          try {
            const backupLoaded = JSON.parse(backup);
            if (sanitizeLoadedData(backupLoaded)) {
              if (show) toast('主存档损坏，已从备份恢复');
              return normalizeLoaded(backupLoaded);
            }
          } catch (_) { /* 备份也损坏 */ }
        }
        if (show) toast('存档损坏，读取失败');
        return null;
      }
    }

    // ---- 自动存档定时器 ----
    function loadFromStorage(show = false) {
      storageLoadDiagnostics.length = 0;
      const candidates = [
        { source: 'primary', key: SAVE_KEY },
        { source: 'backup', key: SAVE_KEY_BACKUP }
      ];

      for (const candidate of candidates) {
        let raw = null;
        try {
          raw = localStorage.getItem(candidate.key);
          if (!raw) {
            storageLoadDiagnostics.push({ source: candidate.source, key: candidate.key, status: 'missing' });
            continue;
          }

          const loaded = JSON.parse(raw);
          if (!sanitizeLoadedData(loaded)) {
            storageLoadDiagnostics.push({ source: candidate.source, key: candidate.key, status: 'rejected', rawLength: raw.length });
            continue;
          }

          const normalized = normalizeLoaded(loaded);
          storageLoadDiagnostics.push({ source: candidate.source, key: candidate.key, status: 'loaded', rawLength: raw.length });
          if (candidate.source === 'backup') localStorage.setItem(SAVE_KEY, raw);
          if (show) toast(candidate.source === 'backup' ? '主存档不可用，已从备份恢复' : '进度已读取');
          console.log('Local save loaded:', {
            source: candidate.source,
            key: candidate.key,
            turn: normalized.turn,
            player: normalized.player?.name,
            savedAt: localStorage.getItem(SAVE_KEY + ':lastSavedAt')
          });
          return normalized;
        } catch (error) {
          storageLoadDiagnostics.push({
            source: candidate.source,
            key: candidate.key,
            status: 'error',
            rawLength: raw ? raw.length : 0,
            error: String(error)
          });
          console.error('Local save candidate could not be loaded:', candidate.source, error);
        }
      }

      if (show) toast('没有可用存档，请检查控制台诊断信息');
      console.warn('No usable local save found:', storageLoadDiagnostics);
      return null;
    }

    function backendApiUrl(path) {
      const base = String(BACKEND_API_BASE_URL || '').replace(/\/+$/, '');
      return base ? base + path : path;
    }

    function readBackendSession() {
      try {
        return JSON.parse(localStorage.getItem(BACKEND_SESSION_KEY) || 'null');
      } catch (_) {
        return null;
      }
    }

    function writeBackendSession(session) {
      localStorage.setItem(BACKEND_SESSION_KEY, JSON.stringify(session));
    }

    async function backendFetch(path, options = {}, meta = {}) {
      const headers = Object.assign({}, options.headers || {});
      if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
      if (!meta.skipAuth) {
        const session = await ensureBackendSession();
        headers.Authorization = 'Bearer ' + session.token;
      }
      const response = await fetch(backendApiUrl(path), Object.assign({}, options, { headers }));
      const text = await response.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch (_) {
        payload = { raw: text };
      }
      if (!response.ok) {
        if (response.status === 401 && !meta.skipAuth && !meta.retry) {
          localStorage.removeItem(BACKEND_SESSION_KEY);
          return backendFetch(path, options, Object.assign({}, meta, { retry: true }));
        }
        const error = new Error(payload?.message || payload?.error || ('HTTP ' + response.status));
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      return payload;
    }

    async function ensureBackendSession() {
      const existing = readBackendSession();
      if (existing?.token && (!existing.expiresAt || Date.parse(existing.expiresAt) > Date.now() + 60000)) {
        return existing;
      }
      const payload = await backendFetch('/api/auth/guest', {
        method: 'POST',
        body: JSON.stringify({
          displayName: gameState?.player?.name || authUser?.displayName || 'Player'
        })
      }, { skipAuth: true });
      writeBackendSession(payload);
      return payload;
    }

    function buildBackendSaveSummary() {
      return {
        turn: gameState.turn,
        playerName: gameState.player?.name || '',
        playerIdentity: gameState.player?.identity || '',
        selectedCityId: gameState.selectedCityId || null,
        savedAt: new Date().toISOString()
      };
    }

    async function saveToBackend(show) {
      const payload = await backendFetch('/api/saves/' + BACKEND_SAVE_SLOT, {
        method: 'PUT',
        body: JSON.stringify({
          name: gameState.player?.name || 'Default Save',
          clientVersion: 'prototype-v1',
          summary: buildBackendSaveSummary(),
          saveData: gameState
        })
      });
      if (show) toast('进度已保存到数据库');
      return payload;
    }

    async function loadFromBackend(show) {
      const payload = await backendFetch('/api/saves/' + BACKEND_SAVE_SLOT);
      const loaded = payload?.saveData;
      if (!loaded) return null;
      if (!sanitizeLoadedData(loaded)) {
        if (show) toast('数据库存档异常，已回退为初始状态');
        return createInitialState();
      }
      if (show) toast('已从数据库读取进度');
      return normalizeLoaded(loaded);
    }

    async function saveGameProgress(show) {
      const localSaved = saveToStorage(false);
      try {
        await saveToBackend(show);
        return true;
      } catch (error) {
        console.warn('Backend save failed, using local storage:', error);
        if (show) toast(localSaved ? '后端不可用，已保存到本地' : '保存失败');
        return localSaved;
      }
    }

    async function loadGameProgress(show) {
      try {
        const remote = await loadFromBackend(show);
        if (remote) return remote;
      } catch (error) {
        console.warn('Backend load failed, using local storage:', error);
      }
      return loadFromStorage(show);
    }

    function compactRemoteDialogueContext(context) {
      const npc = context.npc || {};
      return {
        conversationType: context.conversationType,
        mode: context.mode,
        instruction: context.instruction,
        player: {
          name: context.player?.name,
          identity: context.player?.identity,
          title: context.player?.title,
          ambition: context.player?.ambition,
          protection: context.player?.protection,
          independent: context.player?.independent,
          cityCount: context.player?.cityCount
        },
        npc: {
          id: npc.id,
          name: npc.name,
          faction: npc.faction,
          lordOfFaction: npc.lordOfFaction,
          title: npc.title,
          status: npc.status,
          currentPlan: npc.currentPlan,
          trustPlayer: npc.trustPlayer,
          suspicionOfPlayer: npc.suspicionOfPlayer,
          fearPlayer: npc.fearPlayer,
          respectPlayer: npc.respectPlayer,
          recruitmentDifficulty: npc.recruitmentDifficulty,
          personality: npc.personality,
          stats: npc.stats,
          npcAgency: npc.npcAgency
        },
        relationship: context.relationship,
        powerComparison: context.powerComparison,
        gameState: { turn: context.gameState?.turn },
        recentMemory: Array.isArray(context.recentMemory) ? context.recentMemory.slice(0, 6) : [],
        recentEvents: Array.isArray(context.recentEvents) ? context.recentEvents.slice(0, 4) : [],
        persona: context.persona,
        strategicContext: context.strategicContext,
        availableIntentions: context.availableIntentions
      };
    }

    if (!window.remoteLLMAdapter?.generateNpcDialogue) {
      window.__initLLMAdapter?.({
        generateNpcDialogue: async context => {
          const payload = await backendFetch('/api/ai/dialogue', {
            method: 'POST',
            body: JSON.stringify(compactRemoteDialogueContext(context))
          });
          return payload.dialogue || payload;
        }
      });
    }
    if (!window.remoteLLMAdapter?.generateAiContent) {
      window.__initLLMAdapter?.(Object.assign({}, window.remoteLLMAdapter || {}, {
        generateAiContent: async context => {
          const payload = await backendFetch('/api/ai/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context })
          });
          return payload.text || payload.content || '';
        }
      }));
    }
    if (window.USE_REMOTE_LLM === undefined) window.USE_REMOTE_LLM = true;

    let autosaveTimer = null;

    function updateAutosaveDisplay() {
      const el = document.getElementById('autosaveTime');
      if (!el) return;
      if (gameState.lastAutoSave) {
        const d = new Date(gameState.lastAutoSave);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        el.textContent = '自动存档：' + hh + ':' + mm + ':' + ss;
      } else {
        el.textContent = '自动存档：暂无';
      }
    }

    function startAutosaveTimer() {
      if (autosaveTimer) clearInterval(autosaveTimer);
      autosaveTimer = setInterval(() => {
        saveToStorage(false);
        gameState.lastAutoSave = Date.now();
        updateAutosaveDisplay();
      }, 3 * 60 * 1000);
    }

    function purgeRemovedCitiesFromState(state) {
      if (!state) return state;

      // 1. 删除已移除城市的底层数据
      REMOVED_CITY_IDS.forEach(id => {
        delete state.cities?.[id];
        delete state.mapData?.regions?.[id];
      });

      // 2. 清理所有城市 neighbors / roads / waters
      Object.values(state.cities || {}).forEach(city => {
        city.neighbors = filterRemovedCityIds(city.neighbors);
        city.roads = filterRemovedCityIds(city.roads);
        city.waters = filterRemovedCityIds(city.waters);
      });

      // 3. 清理所有 region neighbors / roads / waters
      Object.values(state.mapData?.regions || {}).forEach(region => {
        region.neighbors = filterRemovedCityIds(region.neighbors);
        region.roads = filterRemovedCityIds(region.roads);
        region.waters = filterRemovedCityIds(region.waters);
      });

      // 4. 清理 selectedCityId
      if (isRemovedCityId(state.selectedCityId)) {
        state.selectedCityId = state.player?.startingCity || 'guiyang';
      }

      // 5. 清理 draftTransfer
      if (isRemovedCityId(state.draftTransfer?.source) || isRemovedCityId(state.draftTransfer?.target)) {
        state.draftTransfer = null;
      }

      // 6. 清理 draftBattle
      if (isRemovedCityId(state.draftBattle?.source) || isRemovedCityId(state.draftBattle?.target)) {
        state.draftBattle = null;
      }

      // 7. 清理 militaryPlanner
      if (isRemovedCityId(state.militaryPlanner?.sourceId)) {
        state.militaryPlanner.sourceId = null;
      }
      if (isRemovedCityId(state.militaryPlanner?.targetId)) {
        state.militaryPlanner.targetId = null;
      }

      // 8. 清理 orders
      state.orders = (state.orders || []).filter(order => {
        const ids = [order.cityId, order.source, order.target, order.payload?.cityId, order.payload?.source, order.payload?.target];
        return !ids.some(isRemovedCityId);
      });

      // 9. 清理 militaryOrders
      state.militaryOrders = (state.militaryOrders || []).filter(order => {
        const ids = [order.cityId, order.source, order.target, order.payload?.cityId, order.payload?.source, order.payload?.target];
        return !ids.some(isRemovedCityId);
      });

      // 10. 清理 campaigns
      state.campaigns = (state.campaigns || []).filter(campaign => {
        const routeIds = Array.isArray(campaign.route)
          ? campaign.route
          : Array.isArray(campaign.route?.path)
            ? campaign.route.path
            : [];
        const ids = [campaign.source, campaign.target, ...routeIds];
        return !ids.some(isRemovedCityId);
      });

      // 11. 清理 urgentMatters
      state.urgentMatters = (state.urgentMatters || []).filter(item => {
        const ids = [item.cityId, item.source, item.target, item.payload?.cityId, item.payload?.source, item.payload?.target];
        return !ids.some(isRemovedCityId);
      });

      return state;
    }

    function purgeInternalPlayerCharactersFromState(state) {
      if (!state) return state;

      INTERNAL_PLAYER_CHARACTER_IDS.forEach(id => {
        if (id === 'player') {
          delete state.characterRoster?.[id];
          delete state.characterDiscovery?.[id];
        }
      });

      if (isInternalPlayerCharacterId(state.selectedCharacterId)) {
        state.selectedCharacterId = null;
      }

      state.conversations = (state.conversations || []).filter(item => {
        const ids = [
          item.characterId,
          item.npcId,
          item.senderId,
          item.targetId
        ];
        return !ids.some(isInternalPlayerCharacterId);
      });

      state.letters = (state.letters || []).filter(letter => {
        const senderId = letter.senderId || letter.fromCharacterId || letter.fromId || letter.sender || letter.characterId || letter.meta?.characterId;
        if (letter.kind === 'npcInitiative' && isInternalPlayerCharacterId(senderId)) {
          return false;
        }
        return true;
      });

      if (state.npcInitiativeState?.lastTurnByNpc) {
        INTERNAL_PLAYER_CHARACTER_IDS.forEach(id => {
          delete state.npcInitiativeState.lastTurnByNpc[id];
        });
      }

      if (Array.isArray(state.npcInitiativeState?.recent)) {
        state.npcInitiativeState.recent = state.npcInitiativeState.recent.filter(
          item => !isInternalPlayerCharacterId(typeof item === 'string' ? item : item?.characterId)
        );
      }

      if (state.activeModal?.characterId && isInternalPlayerCharacterId(state.activeModal.characterId)) {
        state.activeModal = null;
      }

      return state;
    }

    function validateCharacterSystemBase() {
      const roster = gameState.characterRoster || {};
      const visible = typeof visibleCharacters === 'function' ? visibleCharacters() : [];
      const rows = Object.values(roster).map(c => ({
        id: c.id,
        name: c.name,
        faction: c.faction,
        location: c.location,
        offMapLocation: c.offMapLocation,
        type: c.type,
        rarity: c.rarity,
        status: c.status
      }));

      const duplicateIds = [];
      const seen = new Set();
      rows.forEach(c => {
        if (seen.has(c.id)) duplicateIds.push(c.id);
        seen.add(c.id);
      });

      const internalVisible = visible.filter(c => isInternalPlayerCharacterId(c.id)).map(c => c.id + ':' + c.name);

      const invalidLocations = rows.filter(c =>
        c.location && !gameState.cities?.[c.location] && !CITY_BLUEPRINTS?.[c.location]
      );

      const result = {
        total: rows.length,
        visible: visible.length,
        duplicateIds,
        internalVisible,
        invalidLocations,
        hasPlayerCard: !!roster.player,
        selectedIsInternal: isInternalPlayerCharacterId(gameState.selectedCharacterId)
      };

      console.table(result);
      console.table(rows);
      return result;
    }

    window.validateCharacterSystemBase = validateCharacterSystemBase;
    window.revealCharacter = revealCharacter;
    window.unlockCharactersByFaction = unlockCharactersByFaction;
    window.revealAllHistoricalCharacters = revealAllHistoricalCharacters;
    window.triggerScholarRecommendation = triggerScholarRecommendation;
    window.checkNewBorderFactions = checkNewBorderFactions;
    window.checkIntelligenceNetworkUnlocks = checkIntelligenceNetworkUnlocks;
    window.getCurrentBorderFactions = getCurrentBorderFactions;

    function validateLordSolicitationSystem() {
      const rows = Object.values(gameState.characterRoster || {})
        .filter(c => isFactionLordCharacter(c))
        .map(c => {
          const eligibility = getLordSolicitationEligibility(c);
          return {
            id: c.id,
            name: c.name,
            faction: c.faction,
            lordOfFaction: c.lordOfFaction,
            status: c.status,
            isFactionLord: isFactionLordCharacter(c),
            solicitationState: c.solicitationState,
            lordSolicitation: c.lordSolicitation || null,
            eligible: eligibility.eligible,
            locked: eligibility.locked,
            reason: eligibility.reason,
            playerTroops: eligibility.playerTroops,
            targetTroops: eligibility.targetTroops,
            playerPublic: eligibility.playerPublic,
            targetPublic: eligibility.targetPublic,
            details: eligibility.details
          };
        });
      console.table(rows);
      return rows;
    }

    window.validateLordSolicitationSystem = validateLordSolicitationSystem;
    window.startLordSolicitation = startLordSolicitation;

    function validateHistoricalCharacters() {
      const roster = gameState.characterRoster || {};
      const rows = Object.values(roster).map(c => ({
        id: c.id,
        name: c.name,
        faction: c.faction,
        originFaction: c.originFaction,
        possibleFactions: c.possibleFactions,
        location: c.location,
        offMapLocation: c.offMapLocation,
        type: c.type,
        rarity: c.rarity,
        status: c.status,
        command: c.stats?.command,
        strategy: c.stats?.strategy,
        politics: c.stats?.politics,
        charm: c.stats?.charm,
        loyalty: c.stats?.loyalty,
        ambition: c.stats?.ambition
      }));

      const ids = rows.map(r => r.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

      const byFaction = rows.reduce((acc, c) => {
        acc[c.faction] ||= 0;
        acc[c.faction]++;
        return acc;
      }, {});

      const internalVisible = typeof visibleCharacters === 'function'
        ? visibleCharacters().filter(c => isInternalPlayerCharacterId(c.id)).map(c => c.id)
        : [];

      const invalidLocations = rows.filter(c =>
        c.location && !gameState.cities?.[c.location] && !CITY_BLUEPRINTS?.[c.location]
      );

      const missingRequiredFields = rows.filter(c =>
        !c.id || !c.name || !c.faction || !c.type || !c.rarity || !c.status || !c.stats
      );

      const invalidFieldTypes = Object.values(roster).filter(c =>
        !c.stats
        || typeof c.stats.command !== 'number'
        || typeof c.stats.strategy !== 'number'
        || typeof c.stats.politics !== 'number'
        || typeof c.stats.charm !== 'number'
        || typeof c.stats.loyalty !== 'number'
        || typeof c.stats.ambition !== 'number'
        || typeof c.personality !== 'object'
        || Array.isArray(c.personality)
        || typeof c.speechStyle !== 'object'
        || Array.isArray(c.speechStyle)
        || !Array.isArray(c.possibleFactions)
        || !Array.isArray(c.defectionTriggers)
      ).map(c => ({
        id: c.id,
        name: c.name,
        personalityType: Array.isArray(c.personality) ? 'array' : typeof c.personality,
        speechStyleType: Array.isArray(c.speechStyle) ? 'array' : typeof c.speechStyle,
        possibleFactionsIsArray: Array.isArray(c.possibleFactions),
        defectionTriggersIsArray: Array.isArray(c.defectionTriggers)
      }));

      const hiddenInitiativeCandidates = Object.values(roster).filter(c =>
        c.status === 'hidden' && typeof isMajorNpcForInitiative === 'function' && isMajorNpcForInitiative(c)
      ).map(c => ({ id: c.id, name: c.name }));

      const visibleByStatus = rows.reduce((acc, c) => {
        if (c.status !== 'hidden') {
          acc[c.status] ||= 0;
          acc[c.status]++;
        }
        return acc;
      }, {});

      const visibleByFaction = rows.reduce((acc, c) => {
        if (c.status !== 'hidden') {
          acc[c.faction] ||= 0;
          acc[c.faction]++;
        }
        return acc;
      }, {});

      console.table(byFaction);
      console.table(rows);

      return {
        total: rows.length,
        visible: rows.filter(c => c.status !== 'hidden').length,
        hidden: rows.filter(c => c.status === 'hidden').length,
        duplicateIds,
        byFaction,
        internalVisible,
        invalidLocations,
        missingRequiredFields,
        invalidFieldTypes,
        hiddenInitiativeCandidates,
        visibleByStatus,
        visibleByFaction,
        legendaryCount: rows.filter(c => c.rarity === '传奇').length,
        contactableCount: rows.filter(c => c.status === 'contactable').length,
        rows
      };
    }

    window.validateHistoricalCharacters = validateHistoricalCharacters;

    function validateHistoricalCharacterUnlocks() {
      const rows = Object.values(gameState.characterRoster || {}).map(c => ({
        id: c.id,
        name: c.name,
        faction: c.faction,
        status: c.status,
        rarity: c.rarity,
        type: c.type,
        discoveredBy: c.discoveredBy,
        initiativeEligible: typeof isMajorNpcForInitiative === 'function' ? isMajorNpcForInitiative(c) : false,
        internal: isInternalPlayerCharacterId(c.id)
      }));

      const hiddenInitiativeCandidates = rows.filter(c => c.status === 'hidden' && c.initiativeEligible);
      const internalVisible = typeof visibleCharacters === 'function'
        ? visibleCharacters().filter(c => isInternalPlayerCharacterId(c.id)).map(c => c.id)
        : [];

      const visibleByStatus = rows.reduce((acc, c) => {
        if (c.status !== 'hidden') {
          acc[c.status] ||= 0;
          acc[c.status]++;
        }
        return acc;
      }, {});

      const visibleByFaction = rows.reduce((acc, c) => {
        if (c.status !== 'hidden') {
          acc[c.faction] ||= 0;
          acc[c.faction]++;
        }
        return acc;
      }, {});

      const result = {
        total: rows.length,
        visible: rows.filter(c => c.status !== 'hidden').length,
        hidden: rows.filter(c => c.status === 'hidden').length,
        internalVisible,
        hiddenInitiativeCandidates,
        visibleByStatus,
        visibleByFaction,
        legendaryCount: rows.filter(c => c.rarity === '传奇').length,
        contactableCount: rows.filter(c => c.status === 'contactable').length
      };

      console.table(result);
      console.table(rows);
      return result;
    }

    window.validateHistoricalCharacterUnlocks = validateHistoricalCharacterUnlocks;

    function validateAppointmentSystem() {
      normalizeAppointments(gameState);
      const app = gameState.appointments;
      const recruitedCharacters = Object.values(gameState.characterRoster || {})
        .filter(c => c.status === 'recruited' && isExternalCharacter(c))
        .map(c => ({ id: c.id, name: c.name, type: c.type, stats: c.stats }));
      const allAppointedIds = new Set();
      const duplicateAssignments = [];
      const addAppointed = (id, location) => {
        if (!id) return;
        if (allAppointedIds.has(id)) duplicateAssignments.push({ characterId: id, location });
        allAppointedIds.add(id);
      };
      for (const [cityId, slots] of Object.entries(app.cityOfficials || {})) {
        (slots.administratorIds || []).forEach(id => addAppointed(id, 'city:' + cityId + '.administratorId'));
        (slots.militaryOfficerIds || []).forEach(id => addAppointed(id, 'city:' + cityId + '.militaryOfficerId'));
        addAppointed(slots.policyOfficerId, 'city:' + cityId + '.policyOfficerId');
      }
      for (const [campaignId, id] of Object.entries(app.campaignCommanders || {})) {
        addAppointed(id, 'campaign:' + campaignId);
      }
      const invalidCityAppointments = [];
      for (const [cityId, slots] of Object.entries(app.cityOfficials || {})) {
        const city = gameState.cities?.[cityId];
        if (!city || !isActiveMapCity(cityId) || cityController(cityId) !== 'player') {
          invalidCityAppointments.push({ cityId, reason: '城池无效或不属于玩家' });
          continue;
        }
        const checks = [
          ...((slots.administratorIds || []).map(id => ['administratorId', id])),
          ...((slots.militaryOfficerIds || []).map(id => ['militaryOfficerId', id])),
          ['policyOfficerId', slots.policyOfficerId]
        ];
        checks.forEach(([slot, id]) => {
          if (!id) return;
          const char = gameState.characterRoster?.[id];
          const validRole = slot === 'militaryOfficerId' ? canLeadArmy(char) : canManageCity(char);
          if (!char || isInternalPlayerCharacterId(id) || char.status !== 'recruited' || !validRole) {
            invalidCityAppointments.push({ cityId, slot, characterId: id, reason: '人物无效' });
          }
        });
      }
      const invalidCampaignCommanders = [];
      for (const [campaignId, id] of Object.entries(app.campaignCommanders || {})) {
        const campaign = (gameState.campaigns || []).find(c => c.id === campaignId);
        if (!campaign || campaign.faction !== 'player' || campaign.type !== 'attack' || !isActiveCampaign(campaign)) {
          invalidCampaignCommanders.push({ campaignId, characterId: id, reason: '战役无效' });
          continue;
        }
        if (id) {
          const char = gameState.characterRoster?.[id];
          if (!char || isInternalPlayerCharacterId(id) || char.status !== 'recruited') {
            invalidCampaignCommanders.push({ campaignId, characterId: id, reason: '人物无效' });
          }
        }
      }
      return {
        appointments: app,
        cityOfficials: app.cityOfficials,
        campaignCommanders: app.campaignCommanders,
        autoTasks: app.autoTasks,
        recruitedCharacters,
        duplicateAssignments,
        invalidCityAppointments,
        invalidCampaignCommanders
      };
    }
    window.validateAppointmentSystem = validateAppointmentSystem;

    function validateAppointmentTabSystem() {
      return {
        activePanel: gameState.activePanel,
        hasAppointmentsTab: !!document.querySelector('[data-tab="appointments"]'),
        controlledCities: controlledCities().map(c => c.id),
        unassignedCharacters: getUnassignedRecruitedCharacters().map(c => ({
          id: c.id,
          name: c.name,
          type: c.type
        })),
        cityAppointments: controlledCities().map(city => ({
          cityId: city.id,
          cityName: city.name,
          administrators: getCityOfficials(city.id, 'administratorId').map(c => c.name),
          militaryOfficers: getCityOfficials(city.id, 'militaryOfficerId').map(c => c.name),
          policyOfficer: getCityOfficials(city.id, 'policyOfficerId')[0]?.name || null
        })),
        campaignCommanders: (gameState.campaigns || [])
          .filter(c => c.faction === 'player' && c.type === 'attack' && isActiveCampaign(c))
          .map(c => ({
            campaignId: c.id,
            source: c.source,
            target: c.target,
            commander: getCampaignCommander(c)?.name || null
          }))
      };
    }
    window.validateAppointmentTabSystem = validateAppointmentTabSystem;

    function validateCommanderBattleModifiers() {
      return (gameState.campaigns || [])
        .filter(c => c.faction === 'player' && c.type === 'attack' && isActiveCampaign(c))
        .map(c => {
          const commander = getCampaignCommander(c);
          const mod = getCommanderBattleModifier(c);
          return {
            campaignId: c.id,
            source: c.source,
            target: c.target,
            status: c.status,
            commander: commander ? {
              id: commander.id,
              name: commander.name,
              type: commander.type,
              stats: commander.stats
            } : null,
            attackModifier: mod.attack,
            moraleModifier: mod.morale,
            supplyModifier: mod.supply,
            commanderSupplyTick: c.commanderSupplyTick || 0,
            supply: c.supply
          };
        });
    }

    window.validateCommanderBattleModifiers = validateCommanderBattleModifiers;

    function validateCommanderCampaignActions() {
      const active = (gameState.campaigns || [])
        .filter(c => c.faction === 'player' && c.type === 'attack' && isActiveCampaign(c));
      return {
        campaigns: active.map(c => {
          const commander = getCampaignCommander(c);
          return {
            campaignId: c.id,
            source: c.source,
            target: c.target,
            status: c.status,
            phase: c.phase,
            siegeRemaining: c.siegeRemaining,
            supply: c.supply,
            troops: realTroops(c.army),
            commanderActionCooldown: c.commanderActionCooldown || 0,
            lastCommanderActionResult: c.lastCommanderActionResult || null,
            commander: commander ? {
              id: commander.id,
              name: commander.name,
              rarity: commander.rarity,
              type: commander.type,
              stats: commander.stats
            } : null
          };
        }),
        zeroTroopActiveCampaigns: active
          .filter(c => c.army && realTroops(c.army) <= 0)
          .map(c => ({
            campaignId: c.id,
            status: c.status,
            phase: c.phase,
            troops: realTroops(c.army),
            commanderActionCooldown: c.commanderActionCooldown || 0,
            lastCommanderActionResult: c.lastCommanderActionResult || null
          }))
      };
    }

    window.validateCommanderCampaignActions = validateCommanderCampaignActions;

    function validateAppointmentAutoTasks() {
      normalizeAppointments(gameState);
      cleanupInvalidAppointments();
      const autoTasks = gameState.appointments.autoTasks || {};
      const autoGovSpentThisTurn = gameState.appointments.autoGovSpentThisTurn || 0;
      const autoMilSpentThisTurn = gameState.appointments.autoMilSpentThisTurn || 0;
      const govPoints = gameState.actionPoints?.gov || 0;
      const milPoints = gameState.actionPoints?.mil || 0;

      const enabledCities = [];
      const invalidAutoTasks = [];
      const citiesWithAutoTasks = [];
      const staleAutoTasks = [];
      const executablePreview = [];
      const multiCivilPreview = [];
      const militaryPrepPreview = [];
      const resourceWarnings = [];
      const cityOfficialCapacity = [];
      const invalidOfficials = [];
      const duplicateAssignments = [];
      const seen = new Map();

      Object.entries(gameState.appointments.cityOfficials || {}).forEach(([cityId, slots]) => {
        ['administratorIds', 'militaryOfficerIds'].forEach(field => {
          (slots[field] || []).forEach(id => {
            if (seen.has(id)) duplicateAssignments.push({ characterId: id, first: seen.get(id), duplicate: { cityId, field } });
            else seen.set(id, { cityId, field });
          });
        });
        if (slots.policyOfficerId) {
          if (seen.has(slots.policyOfficerId)) duplicateAssignments.push({ characterId: slots.policyOfficerId, first: seen.get(slots.policyOfficerId), duplicate: { cityId, field: 'policyOfficerId' } });
          else seen.set(slots.policyOfficerId, { cityId, field: 'policyOfficerId' });
        }
      });

      Object.entries(autoTasks).forEach(([cityId, task]) => {
        const city = gameState.cities?.[cityId];
        const playerControlled = city ? isControlledBy(city.id, 'player') : false;
        citiesWithAutoTasks.push({ cityId, cityName: city ? city.name : '未知', playerControlled, ...task });
        if (!city || !playerControlled) {
          staleAutoTasks.push({ cityId, cityName: city ? city.name : '未知', playerControlled, enabled: task.enabled, task });
          return;
        }

        const administrators = getCityOfficials(cityId, 'administratorId');
        const militaryOfficers = getCityOfficials(cityId, 'militaryOfficerId');
        const policyOfficers = getCityOfficials(cityId, 'policyOfficerId');
        const civilModes = getUniqueAutoTaskModes(task, 'civilModes', 'civilMode', ['relief', 'farming', 'defense', 'order']);
        const militaryPrepModes = getUniqueAutoTaskModes(task, 'militaryPrepModes', 'militaryPrepMode', MILITARY_PREP_MODE_LIST);
        const executableCivilCount = Math.min(administrators.length, civilModes.length, getCityAdministratorLimit(city));
        const executableMilitaryPrepCount = Math.min(militaryOfficers.length, militaryPrepModes.length, getCityMilitaryOfficerLimit(city));

        cityOfficialCapacity.push({
          cityId,
          cityName: city.name,
          administratorIds: administrators.map(c => c.id),
          administratorLimit: getCityAdministratorLimit(city),
          militaryOfficerIds: militaryOfficers.map(c => c.id),
          militaryOfficerLimit: getCityMilitaryOfficerLimit(city),
          policyOfficerId: policyOfficers[0]?.id || null
        });

        if (task.enabled === true) {
          const info = {
            cityId,
            cityName: city.name,
            militaryMode: task.militaryMode,
            civilMode: task.civilMode,
            civilModes,
            policyMode: task.policyMode,
            militaryPrepMode: task.militaryPrepMode,
            militaryPrepModes,
            administratorIds: administrators.map(c => c.id),
            administratorLimit: getCityAdministratorLimit(city),
            militaryOfficerIds: militaryOfficers.map(c => c.id),
            militaryOfficerLimit: getCityMilitaryOfficerLimit(city),
            executableCivilCount,
            executableMilitaryPrepCount,
            issues: []
          };
          if (task.militaryMode && task.militaryMode !== 'none' && !militaryOfficers.length) info.issues.push('军事官未任命');
          if (civilModes.length && !administrators.length) info.issues.push('主政官未任命');
          if (task.policyMode && task.policyMode !== 'none' && !policyOfficers.length) info.issues.push('政策官未任命');
          if (militaryPrepModes.length && !militaryOfficers.length) info.issues.push('军事整备缺少军事官');
          enabledCities.push(info);
          if (info.issues.length) invalidAutoTasks.push(info);

          executablePreview.push({
            cityId,
            cityName: city.name,
            militaryMode: task.militaryMode,
            civilModes,
            policyMode: task.policyMode,
            militaryPrepModes,
            govPoints,
            milPoints,
            autoGovSpentThisTurn,
            autoMilSpentThisTurn,
            willExecute: task.militaryMode !== 'none' || civilModes.length > 0 || task.policyMode !== 'none' || militaryPrepModes.length > 0
          });
          multiCivilPreview.push({ cityId, cityName: city.name, civilModes, administrators: administrators.map(c => c.name), executableCivilCount });
          militaryPrepPreview.push({ cityId, cityName: city.name, militaryPrepModes, militaryOfficers: militaryOfficers.map(c => c.name), executableMilitaryPrepCount });

          civilModes.forEach(mode => {
            const costFood = Math.round(city.population / 85);
            const costMoney = mode === 'farming' ? Math.round(180 + city.population / 1000)
              : mode === 'defense' ? Math.round(130 + city.level * 90 + city.defense * 4)
              : mode === 'order' ? Math.round(90 + city.population / 1800) : 0;
            if (mode === 'relief' && city.food < costFood) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['粮草不足'] });
            if (mode !== 'relief' && city.money < costMoney) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['府库不足'] });
          });
          militaryPrepModes.forEach(mode => {
            if (mode === 'drill' && city.food < 80) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['粮草不足'] });
            if (mode === 'defense' && city.money < 80) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['府库不足'] });
            if (SPECIAL_TRAINING_ACTIONS[mode]) {
              const plan = getSpecializedTrainingPlan(city, mode);
              if (plan && city.food < plan.foodCost) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['粮草不足'] });
              if (plan && city.money < plan.moneyCost) resourceWarnings.push({ cityId, cityName: city.name, mode, warnings: ['府库不足'] });
            }
          });
        }
      });

      return {
        autoTasks,
        autoGovBudgetLimit: getAutoGovBudgetLimit(),
        autoMilBudgetLimit: getAutoMilBudgetLimit(),
        autoGovUnlimited: true,
        autoMilUnlimited: true,
        autoGovSpentThisTurn,
        autoMilSpentThisTurn,
        govPoints,
        milPoints,
        enabledCities,
        invalidAutoTasks,
        staleAutoTasks,
        executablePreview,
        cityOfficialCapacity,
        multiCivilPreview,
        militaryPrepPreview,
        resourceWarnings,
        duplicateAssignments,
        invalidOfficials,
        citiesWithAutoTasks
      };
    }

    window.validateAppointmentAutoTasks = validateAppointmentAutoTasks;

    function validateMultiOfficialAutomation() {
      normalizeAppointments(gameState);
      return Object.values(gameState.cities || {})
        .filter(city => isControlledBy(city.id, 'player'))
        .map(city => {
          const task = gameState.appointments?.autoTasks?.[city.id] || {};
          const admins = getCityOfficials(city.id, 'administratorId');
          const officers = getCityOfficials(city.id, 'militaryOfficerId');
          const civilModes = getUniqueAutoTaskModes(task, 'civilModes', 'civilMode', ['relief', 'farming', 'defense', 'order']);
          const prepModes = getUniqueAutoTaskModes(task, 'militaryPrepModes', 'militaryPrepMode', MILITARY_PREP_MODE_LIST);
          return {
            cityId: city.id,
            cityName: city.name,
            administratorLimit: getCityAdministratorLimit(city),
            administrators: admins.map(c => c.name),
            civilModes,
            executableCivilCount: Math.min(admins.length, civilModes.length, getCityAdministratorLimit(city)),
            militaryOfficerLimit: getCityMilitaryOfficerLimit(city),
            militaryOfficers: officers.map(c => c.name),
            militaryPrepModes: prepModes,
            executableMilitaryPrepCount: Math.min(officers.length, prepModes.length, getCityMilitaryOfficerLimit(city)),
            autoGovBudgetLimit: getAutoGovBudgetLimit(),
            autoMilBudgetLimit: getAutoMilBudgetLimit(),
            autoGovUnlimited: true,
            autoMilUnlimited: true
          };
        });
    }

    window.validateMultiOfficialAutomation = validateMultiOfficialAutomation;

    function migrateGameState(loaded) {
      const migrated = loaded && typeof loaded === 'object' ? loaded : {};
      migrated.schemaVersion ||= 4;
      migrated.player ||= {};
      migrated.player.commandSlots ||= 2;
      migrated.randomTalentSeed ||= Math.floor(Date.now() % 2147483647) || 190;
      migrated.characterRoster ||= {};
      migrated.characterDiscovery ||= {};
      migrated.conversations ||= [];
      migrated.npcInitiativeState ||= { lastTurnByNpc: {}, recent: [] };
      migrated.specialEventState ||= { triggered: {}, cooldowns: {}, queue: [] };
      migrated.letters ||= [];
      migrated.storyFlags ||= {};
      const milingCinematic = { src: './assets/opening/miling-ru-xia.mp4', title: '密令入匣' };
      const xiangyangLetterCinematic = { src: './assets/opening/xiangyang-lai-xin.mp4?v=raw-v1', title: '襄阳来信' };
      const kuaiYueInspectionCinematic = { src: './assets/opening/kuai-yue-xun-shi.mp4?v=raw-v1', title: '蒯越巡视' };
      const sonsConflictCinematic = { src: './assets/opening/er-zi-zhi-zheng.mp4?v=raw-v1', title: '二子之争' };
      const loyalEntrustmentCinematic = { src: './assets/opening/zhong-chen-tuo-gu.mp4', title: '忠臣托孤' };
      const liuQiOrthodoxCinematic = { src: './assets/opening/liu-qi-zheng-tong.mp4?v=replace-v3', title: '刘琦正统' };
      const caiLiuCongCinematic = { src: './assets/opening/cai-shi-liu-cong.mp4?v=replace-v2', title: '蔡氏刘琮' };
      const ambiguousWillCinematic = { src: './assets/opening/yi-ming-mo-hu.mp4', title: '遗命模糊' };
      const xiangyangRainCinematic = { src: './assets/opening/xiangyang-ye-yu.mp4', title: '襄阳夜雨' };
      if (!migrated.storyFlags.milingCinematicFullscreenMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_1_1') return;
          letter.meta.cinematic = milingCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.milingCinematicFullscreenMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId === 'lb_1_1') letter.meta.cinematic ||= milingCinematic;
        });
      }
      if (!migrated.storyFlags.xiangyangLetterCinematicRawMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_1_2') return;
          letter.meta ||= {};
          letter.meta.cinematic = xiangyangLetterCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.xiangyangLetterCinematicRawMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId === 'lb_1_2') letter.meta.cinematic ||= xiangyangLetterCinematic;
        });
      }
      if (!migrated.storyFlags.kuaiYueInspectionCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_1_3') return;
          letter.meta ||= {};
          letter.meta.cinematic = kuaiYueInspectionCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.kuaiYueInspectionCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId === 'lb_1_3') letter.meta.cinematic ||= kuaiYueInspectionCinematic;
        });
      }
      if (!migrated.storyFlags.sonsConflictCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_3_2') return;
          letter.meta ||= {};
          letter.meta.cinematic = sonsConflictCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.sonsConflictCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId === 'lb_3_2') letter.meta.cinematic ||= sonsConflictCinematic;
        });
      }
      if (!migrated.storyFlags.loyalEntrustmentCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir !== 'player') return;
          letter.meta ||= {};
          letter.meta.cinematic = loyalEntrustmentCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.loyalEntrustmentCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir === 'player') letter.meta.cinematic ||= loyalEntrustmentCinematic;
        });
      }
      if (!migrated.storyFlags.liuQiOrthodoxCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir !== 'liuQi') return;
          letter.meta ||= {};
          letter.meta.cinematic = liuQiOrthodoxCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.liuQiOrthodoxCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir === 'liuQi') letter.meta.cinematic ||= liuQiOrthodoxCinematic;
        });
      }
      if (!migrated.storyFlags.caiLiuCongCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir !== 'liuCong') return;
          letter.meta ||= {};
          letter.meta.cinematic = caiLiuCongCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.caiLiuCongCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir === 'liuCong') letter.meta.cinematic ||= caiLiuCongCinematic;
        });
      }
      if (!migrated.storyFlags.ambiguousWillCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir !== 'ambiguous') return;
          letter.meta ||= {};
          letter.meta.cinematic = ambiguousWillCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.ambiguousWillCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_4_2') return;
          const lineState = migrated.plotLineStates?.liu_biao;
          if (lineState?.variables?.liuBiaoHeir === 'ambiguous') letter.meta.cinematic ||= ambiguousWillCinematic;
        });
      }
      if (!migrated.storyFlags.xiangyangRainCinematicMigrated) {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId !== 'lb_5_rain') return;
          letter.meta ||= {};
          letter.meta.cinematic = xiangyangRainCinematic;
          delete letter.meta.cinematicWatched;
        });
        migrated.storyFlags.xiangyangRainCinematicMigrated = true;
      } else {
        migrated.letters.forEach(letter => {
          if (letter?.meta?.nodeId === 'lb_5_rain') letter.meta.cinematic ||= xiangyangRainCinematic;
        });
      }
      migrated.militaryOrders ||= [];
      migrated.campaigns ||= [];
      migrated.urgentMatters ||= [];
      migrated.turnEvents ||= [];
      migrated.turnSummaries ||= [];
      migrated.visualEffects ||= [];
      migrated.gameMode = migrated.gameMode === 'story' ? 'story' : 'sandbox';
      migrated.plotLineStates ||= {};
      migrated.storyFlags.attackedLiuBiao ||= false;
      migrated.storyFlags.voluntarilyBrokeWithLiuBiao ||= false;
      migrated.storyFlags.liuBiaoLoyalActions ||= { report: 0, loyal: 0, supplies: 0, conceal: 0 };
      migrated.storyFlags.plagueState ||= { activeByCity: {}, lastCheckTurn: 0, lastOutbreakTurn: 0 };
      migrated.storyFlags.plagueState.activeByCity ||= {};
      migrated.storyFlags.redemptionLines ||= {};
      migrated.tutorial ||= null;
      migrated.militaryPlanner ||= { sourceId: null, targetId: null, route: 'official' };
      migrated.factionWarState ||= { lastAttackTurnByFaction: {}, recentWars: [] };
      migrated.submissionState ||= {};
      migrated.publicUnrestState ||= { lastCrisisTurnByCity: {}, rebellionCities: {}, intelligenceLeaks: [], localDefectionOpportunities: {} };
      migrated.publicUnrestState.lastCrisisTurnByCity ||= {};
      migrated.publicUnrestState.rebellionCities ||= {};
      migrated.publicUnrestState.intelligenceLeaks ||= [];
      migrated.publicUnrestState.localDefectionOpportunities ||= {};
      migrated.factionRelations ||= structuredClone(DEFAULT_FACTION_RELATIONS);
      migrated.diplomacy ||= {};
      Object.keys(FACTIONS).forEach(factionId => {
        if (factionId !== 'player') migrated.diplomacy[factionId] ||= { relation: 30, pact: '未接触', alliance: null };
        if (factionId !== 'player' && migrated.diplomacy[factionId]) migrated.diplomacy[factionId].alliance ||= null;
      });
      migrated.aiContentCache ||= {};
      migrated.aiContentPayloads ||= {};
      migrated.aiContentPending ||= {};
      migrated.characterProfileId ||= null;
      migrated.appointments ||= { cityOfficials: {}, campaignCommanders: {}, autoTasks: {} };
      migrated.aiUsage ||= {};
      migrated.aiUsage.turn ||= migrated.turn || 1;
      migrated.aiUsage.turnDialogueCalls ||= 0;
      migrated.aiUsage.maxDialogueCallsPerTurn ||= 5;
      migrated.aiUsage.turnContentCalls ||= 0;
      migrated.aiUsage.maxContentCallsPerTurn ||= 6;
      migrated.schemaVersion = GAME_SCHEMA_VERSION;
      normalizeAppointments(migrated);
      return purgeRemovedCitiesFromState(migrated);
    }

    function normalizeLoaded(loaded) {
      loaded = migrateGameState(loaded);
      const fresh = createInitialState();
      // 兼容旧存档：补齐 tutorial 对象
      if (!loaded.tutorial || typeof loaded.tutorial !== 'object') {
        loaded.tutorial = structuredClone(fresh.tutorial);
      } else {
        loaded.tutorial.guideSeen = Object.assign(structuredClone(fresh.tutorial.guideSeen), loaded.tutorial.guideSeen || {});
        if (!Array.isArray(loaded.tutorial.tasks)) {
          loaded.tutorial.tasks = structuredClone(fresh.tutorial.tasks);
        } else {
          // 补齐缺失的任务
          const existingIds = new Set(loaded.tutorial.tasks.map(task => task.id));
          fresh.tutorial.tasks.forEach(task => {
            if (!existingIds.has(task.id)) loaded.tutorial.tasks.push(task);
          });
        }
      if (!Array.isArray(loaded.tutorial.unlockedTabs)) {
          loaded.tutorial.unlockedTabs = structuredClone(fresh.tutorial.unlockedTabs);
        }
        if (loaded.tutorial.trackedTaskId === undefined) loaded.tutorial.trackedTaskId = null;
        if (!Array.isArray(loaded.tutorial.guideQueue)) loaded.tutorial.guideQueue = [];
        if (loaded.tutorial.skipped === undefined) loaded.tutorial.skipped = false;
      }
      if (loaded.tutorial.unlockedTabs.includes('characters') && !loaded.tutorial.unlockedTabs.includes('appointments')) {
        loaded.tutorial.unlockedTabs.push('appointments');
      }
      if (!loaded.tutorial.unlockedTabs.includes('security')) {
        loaded.tutorial.unlockedTabs.push('security');
      }
      let normalized = Object.assign(fresh, loaded, {
        factions: FACTIONS,
        cities: Object.assign(structuredClone(CITY_BLUEPRINTS), loaded.cities || {}),
        characters: Object.assign(fresh.characters, loaded.characters || {}),
        diplomacy: Object.assign(fresh.diplomacy, loaded.diplomacy || {}),
        storyFlags: Object.assign(fresh.storyFlags, loaded.storyFlags || {}),
        plotLineStates: Object.assign(fresh.plotLineStates || {}, loaded.plotLineStates || {}),
        aiMemory: Object.assign(fresh.aiMemory, loaded.aiMemory || {}),
        mapState: Object.assign(fresh.mapState, loaded.mapState || {}),
        militaryPlanner: Object.assign(fresh.militaryPlanner, loaded.militaryPlanner || { sourceId: null, targetId: null, route: 'official' }),
        factionWarState: Object.assign(fresh.factionWarState, loaded.factionWarState || { lastAttackTurnByFaction: {}, recentWars: [] }),
        publicUnrestState: Object.assign(fresh.publicUnrestState, loaded.publicUnrestState || { lastCrisisTurnByCity: {}, rebellionCities: {}, intelligenceLeaks: [], localDefectionOpportunities: {} }),
        factionRelations: Object.assign(fresh.factionRelations, loaded.factionRelations || structuredClone(DEFAULT_FACTION_RELATIONS)),
        aiContentCache: Object.assign(fresh.aiContentCache, loaded.aiContentCache || {}),
        aiContentPayloads: Object.assign(fresh.aiContentPayloads, loaded.aiContentPayloads || {}),
        aiContentPending: Object.assign(fresh.aiContentPending, loaded.aiContentPending || {}),
        aiUsage: Object.assign(fresh.aiUsage, loaded.aiUsage || {}),
      });
      Object.values(normalized.cities).forEach(normalizeCityPolicy);
      normalized.mapState = normalizeMapState(normalized.mapState);
      normalized.gameMode = normalized.gameMode === 'story' ? 'story' : 'sandbox';
      normalized.plotLineStates ||= {};
      if (!normalized.publicSupportSystemVersion || normalized.publicSupportSystemVersion < 2) {
        applyInitialPublicSupportProfiles(normalized, true);
      }
      if (!normalized.publicSupportSystemVersion || normalized.publicSupportSystemVersion < 4) {
        applyPublicSupportRebalanceProfiles(normalized);
      }
      ensureCityLink(normalized.cities.guiyang, 'yuzhang', { road: true });
      ensureCityLink(normalized.cities.yuzhang, 'guiyang', { road: true });
      ensureRoutePair(ROUTES, 'changsha', 'guiyang');
      ensureRoutePair(ROUTES, 'guiyang', 'yuzhang');
      normalized = purgeRemovedCitiesFromState(normalized);
      normalized = purgeInternalPlayerCharactersFromState(normalized);
      return ensureCharacterSystemState(normalized);
    }

    function validatePublicSupportSystem() {
      const unrest = gameState.publicUnrestState || {};
      const rows = Object.values(gameState.cities || {}).map(city => {
        const eco = calculateCityEconomy(city);
        const mod = getPublicSupportEconomyModifier(city);
        const governanceTarget = publicSupportGovernanceTarget(city, eco);
        const projectedDelta = Math.max(
          Number(eco.publicDelta || 0) + publicSupportStabilityDelta(city, eco),
          Number(city.publicSupport || 0) >= 60 ? -2.8 : Number(city.publicSupport || 0) >= 45 ? -1.6 : Number(city.publicSupport || 0) >= 25 ? -0.9 : -0.4
        );
        const rebellion = unrest.rebellionCities?.[city.id] || null;
        const leaks = (unrest.intelligenceLeaks || []).filter(l => l.cityId === city.id);
        return {
          id: city.id,
          name: city.name,
          controller: cityController(city.id),
          publicSupport: Math.round(city.publicSupport || 0),
          order: Math.round(city.order || 0),
          label: publicSupportLabel(city),
          governanceTarget,
          publicDelta: Math.round(Number(eco.publicDelta || 0)),
          stabilizedPublicDelta: Math.round(projectedDelta),
          projectedPublicSupport: Math.round(clamp(Number(city.publicSupport || 0) + projectedDelta, 0, 100)),
          orderDelta: Math.round(Number(eco.orderDelta || 0)),
          foodMod: mod.food,
          taxMod: mod.tax,
          recruitMod: mod.recruit,
          netFood: eco.netFood,
          taxIncome: eco.taxIncome,
          crisisLevel: getPublicUnrestLevel(city),
          initialCalculatedSupport: calculateInitialPublicSupport(city),
          rebellion: rebellion ? {
            turn: rebellion.turn,
            rebelTroops: rebellion.rebelTroops,
            severity: rebellion.severity,
            progress: rebellion.progress || 0,
            suppressed: !!rebellion.suppressed
          } : null,
          leakToFaction: leaks.length > 0
            ? leaks.map(l => l.toFaction || '泛泄露').join(',')
            : null
        };
      });
      const activeRows = rows.filter(row => !isRemovedCityId(row.id));
      const summary = {
        cities: activeRows.length,
        supportAtLeast60: activeRows.filter(row => row.publicSupport >= 60).length,
        supportAtLeast60Pct: Math.round(activeRows.filter(row => row.publicSupport >= 60).length / Math.max(1, activeRows.length) * 100),
        belowGovernanceFloor: activeRows.filter(row => row.publicSupport < Math.min(60, row.governanceTarget)).length,
        below45: activeRows.filter(row => row.publicSupport < 45).length,
        projectedBelow45: activeRows.filter(row => row.projectedPublicSupport < 45).length,
        collapseCities: activeRows.filter(row => row.publicSupport <= 0).length
      };
      console.table([summary]);
      console.table(rows);
      return { summary, rows };
    }

    function setCityPublicSupport(cityId, value) {
      const city = gameState.cities?.[cityId];
      if (!city) return null;
      city.publicSupport = clamp(Number(value), 0, 100);
      render();
      return city;
    }

    function forcePublicSupportCrisis(cityId) {
      const city = gameState.cities?.[cityId];
      if (!city) return null;
      const reports = [];
      triggerPublicSupportCrisis(city, reports, { force: true });
      reports.forEach(report => addNews(report.tone, report.text));
      render();
      return reports;
    }

    window.validatePublicSupportSystem = validatePublicSupportSystem;
    window.setCityPublicSupport = setCityPublicSupport;
    window.forcePublicSupportCrisis = forcePublicSupportCrisis;

    function resetGame() {
      if (!confirm('确定重开？当前未保存进度会丢失。')) return;
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_BACKUP);
      localStorage.removeItem(SAVE_KEY + ':lastSavedAt');
      beginNewGameFlow();
    }

    function restartAfterDefeat() {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_BACKUP);
      localStorage.removeItem(SAVE_KEY + ':lastSavedAt');
      document.getElementById('defeatEndingRoot')?.classList.remove('show');
      beginNewGameFlow();
    }

    // ===================== 分阶段新手引导系统 =====================

    function getTutorialTask(taskId) {
      return gameState.tutorial.tasks.find(task => task.id === taskId);
    }

    function completeTutorialTask(taskId) {
      const task = getTutorialTask(taskId);
      if (!task || task.completed) return;
      task.completed = true;
      addNews('good', '任务完成：' + task.label);
      unlockTabsByTutorialProgress();
      advanceTutorialAfterTask(taskId);
      saveToStorage(false);
      render();
    }

    function isTabUnlocked(tabId) {
      return gameState.tutorial.unlockedTabs.includes(tabId);
    }

    function getTabUnlockHint(tabId) {
      const state = gameState;
      const network = state.characters?.retinue?.network ?? 0;
      const prestige = state.player?.prestige ?? 0;
      const protection = state.player?.protection ?? 0;
      const organizeDone = getTutorialTask('organizeRetinue')?.completed || false;
      const hints = {
        transfer: { name: '调兵', desc: '调兵用于在你控制的城池之间移动兵力。', condition: '你需要先整肃亲信班底（' + (organizeDone ? '已完成' : '未完成') + '）。' },
        scheme: { name: '谋略', desc: '谋略用于刺探、断粮、内应和扰乱敌军。', condition: '你需要先整肃亲信，并将情报网络提升至 30（当前 ' + network + '/30）。' },
        diplomacy: { name: '外交', desc: '外交用于结盟、借道、示好和求援。', condition: '你需要声望 ≥ 10（当前 ' + prestige + '/10）且刘表庇护 ≥ 60（当前 ' + protection + '/60）。' },
        inner: { name: '亲信', desc: '亲信用于整肃亲兵、安插府衙亲信、掌握粮道、联络郡兵、扩展情报网络。', condition: '你需要先查看刘表密令（打开刘表 tab）。' },
        liubiao: { name: '刘表', desc: '刘表是你的名义主君与保护伞。', condition: '你需要先完成一次城政和一次军事调整。' },
        characters: { name: '人物', desc: '查看荆州及周边重要人物关系。', condition: '跟随亲信 tab 一起解锁。需要先查看刘表密令。' },
        appointments: { name: '任命', desc: '集中管理城市官员、自动治理、军事整备和战役主将。', condition: '跟随人物 tab 一起解锁。需要先查看刘表密令。' }
      };
      return hints[tabId] || { name: tabId, desc: '暂未开放的功能。', condition: '请继续推进主线任务。' };
    }

    function getTabUnlockTaskId(tabId) {
      const map = {
        liubiao: 'firstMilitaryOrder',
        inner: 'visitLiuBiao',
        transfer: 'unlockTransfer',
        scheme: 'unlockScheme',
        diplomacy: 'unlockDiplomacy',
        characters: 'visitLiuBiao',
        appointments: 'visitLiuBiao'
      };
      return map[tabId] || null;
    }

    function tryOpenTab(tabId) {
      if (isTabUnlocked(tabId)) {
        gameState.activePanel = tabId;
        if (tabId === 'characters') {
          gameState.characterProfileId = null;
        }
        // 刘表 tab 首次打开完成 visitLiuBiao 任务
        if (tabId === 'liubiao' && !getTutorialTask('visitLiuBiao').completed) {
          completeTutorialTask('visitLiuBiao');
        }
        if (tabId === 'transfer') {
          const source = gameState.cities[gameState.selectedCityId] && isControlledBy(gameState.selectedCityId, 'player')
            ? gameState.selectedCityId
            : (controlledCities()[0] && controlledCities()[0].id);
          if (source) {
            const firstTarget = cityNeighborIds(source).find(id => isControlledBy(id, 'player')) || source;
            gameState.draftTransfer = { source, target: firstTarget, troops: 500 };
          }
        }
        render();
        return;
      }
      // 未解锁：显示提示
      const hint = getTabUnlockHint(tabId);
      const taskId = getTabUnlockTaskId(tabId);
      if (taskId) setTrackedTask(taskId);
      const trackedLabel = taskId ? '已为你追踪该目标。' : '';
      gameState.activeModal = {
        type: 'eventDetail',
        title: hint.name + '：尚未解锁',
        text: hint.desc + ' 当前尚未解锁：' + hint.condition + ' ' + trackedLabel
      };
      render();
    }

    const GAME_KEYBOARD_TAB_SHORTCUTS = {
      '1': 'city',
      '2': 'military',
      '3': 'scheme',
      '4': 'diplomacy',
      '5': 'inner',
      '6': 'characters',
      '7': 'appointments',
      '8': 'liubiao'
    };

    function shouldIgnoreGameKeyboardShortcut(event) {
      if (launchScreen !== 'game' || event.repeat || event.isComposing) return true;
      if (event.ctrlKey || event.metaKey || event.altKey) return true;
      if (gameState.activeModal || document.querySelector('[data-letter-cinematic-video]')) return true;
      const target = event.target;
      return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable="true"]'));
    }

    function handleGameKeyboardShortcut(event) {
      if (shouldIgnoreGameKeyboardShortcut(event)) return;
      const tabId = GAME_KEYBOARD_TAB_SHORTCUTS[event.key];
      if (tabId) {
        event.preventDefault();
        if (checkForceAction('clickTab', tabId)) return;
        tryOpenTab(tabId);
        if (isGuideActive() && isForceAction('clickTab', tabId)) advanceGuideStep();
        return;
      }
      if (event.code !== 'Space') return;
      event.preventDefault();
      if (checkForceAction('endTurn', 'endTurn')) return;
      endTurn();
    }

    function unlockTabByTutorial(tabId) {
      if (!gameState.tutorial) return;
      if (!gameState.tutorial.unlockedTabs.includes(tabId)) {
        gameState.tutorial.unlockedTabs.push(tabId);
        showToast('解锁新功能：' + (getTabUnlockHint(tabId).name || tabId));
        maybeShowNewGuideAfterUnlock(tabId);
      }
    }

    function maybeShowNewGuideAfterUnlock(tabId) {
      const guideByTab = {
        liubiao: 'liubiao',
        inner: 'inner',
        transfer: 'transfer',
        scheme: 'scheme',
        diplomacy: 'diplomacy'
      };
      const guideId = guideByTab[tabId];
      if (!guideId) return;
      if (gameState.activeModal) {
        // 已有 modal，加入队列
        if (!gameState.tutorial.guideQueue.includes(guideId)) {
          gameState.tutorial.guideQueue.push(guideId);
        }
        return;
      }
      maybeShowGuide(guideId);
    }

    function processGuideQueue() {
      if (!gameState.tutorial.guideQueue.length) return;
      if (gameState.activeModal) return;
      const next = gameState.tutorial.guideQueue.shift();
      maybeShowGuide(next);
    }

    function unlockTabsByTutorialProgress() {
      const tasks = gameState.tutorial.tasks;
      const t = (id) => getTutorialTask(id)?.completed || false;

      // 刘表解锁：完成城政 + 军事
      if (t('firstCityOrder') && t('firstMilitaryOrder')) {
        unlockTabByTutorial('liubiao');
      }
      // 亲信 + 人物解锁：查看刘表
      if (t('visitLiuBiao')) {
        unlockTabByTutorial('inner');
        unlockTabByTutorial('characters');
        unlockTabByTutorial('appointments');
      }
      // 调兵解锁：整肃亲信
      if (t('organizeRetinue')) {
        unlockTabByTutorial('transfer');
        if (!t('unlockTransfer')) completeTutorialTaskSilent('unlockTransfer');
      }
      // 谋略解锁：亲信情报网络 ≥ 30
      if (t('organizeRetinue') && gameState.characters.retinue.network >= 30) {
        unlockTabByTutorial('scheme');
        if (!t('unlockScheme')) completeTutorialTaskSilent('unlockScheme');
      }
      // 外交解锁：声望 ≥ 10 且刘表庇护 ≥ 60
      if (t('organizeRetinue') && gameState.player.prestige >= 10 && gameState.player.protection >= 60) {
        unlockTabByTutorial('diplomacy');
        if (!t('unlockDiplomacy')) completeTutorialTaskSilent('unlockDiplomacy');
      }
      updateTabLockStates();
    }

    function completeTutorialTaskSilent(taskId) {
      const task = getTutorialTask(taskId);
      if (!task || task.completed) return false;
      task.completed = true;
      return true;
    }

    function advanceTutorialAfterTaskSilent(taskId) {
      const nextMap = {
        inspectGuiyang: 'firstCityOrder',
        firstCityOrder: 'firstMilitaryOrder',
        firstMilitaryOrder: 'visitLiuBiao',
        visitLiuBiao: 'organizeRetinue',
        organizeRetinue: null
      };
      const next = nextMap[taskId];
      if (next) {
        gameState.tutorial.trackedTaskId = next;
      } else {
        gameState.tutorial.trackedTaskId = getDefaultTrackedTask();
      }
    }

    function setTrackedTask(taskId) {
      const task = getTutorialTask(taskId);
      if (!task) {
        gameState.tutorial.trackedTaskId = getDefaultTrackedTask();
        return;
      }
      gameState.tutorial.trackedTaskId = taskId;
    }

    function getDefaultTrackedTask() {
      const firstPending = gameState.tutorial.tasks.find(task => !task.completed);
      return firstPending ? firstPending.id : null;
    }

    function completeFirstMilitaryOrderAfterResolved(reason, reports) {
      if (!gameState.tutorial) return false;
      if (getTutorialTask('firstMilitaryOrder')?.completed) return false;

      const completed = completeTutorialTaskSilent('firstMilitaryOrder');
      if (!completed) return false;

      reports?.push({
        tone: 'good',
        text: '任务完成：完成一次军事调整。'
      });

      unlockTabsByTutorialProgress();
      advanceTutorialAfterTaskSilent('firstMilitaryOrder');

      return true;
    }

    function validateMilitaryTutorialCompletion() {
      const task = getTutorialTask('firstMilitaryOrder');
      return {
        firstMilitaryOrderCompleted: !!task?.completed,
        trackedTaskId: gameState.tutorial?.trackedTaskId,
        orders: gameState.orders?.map(o => ({
          id: o.id,
          type: o.type,
          point: o.point,
          pointCost: o.pointCost,
          label: o.label,
          payload: o.payload
        })),
        activePanel: gameState.activePanel,
        milPoints: gameState.actionPoints?.mil,
        militaryOrders: gameState.militaryOrders || []
      };
    }
    window.validateMilitaryTutorialCompletion = validateMilitaryTutorialCompletion;

    function advanceTutorialAfterTask(taskId) {
      const nextMap = {
        inspectGuiyang: 'firstCityOrder',
        firstCityOrder: 'firstMilitaryOrder',
        firstMilitaryOrder: 'visitLiuBiao',
        visitLiuBiao: 'organizeRetinue',
        organizeRetinue: null // 之后由条件自动解锁
      };
      const next = nextMap[taskId];
      if (next) {
        setTrackedTask(next);
      } else {
        gameState.tutorial.trackedTaskId = getDefaultTrackedTask();
      }
      saveToStorage(false);
      render();
    }

    function maybeShowGuide(guideId) {
      if (!gameState.tutorial || gameState.tutorial.skipped) return;
      if (gameState.tutorial.guideSeen?.[guideId]) return;
      if (isGuideActive()) return; // Don't show old guides during force guide
      gameState.activeModal = { type: 'tutorialGuide', guideId };
      render();
    }

    function markGuideSeen(guideId) {
      gameState.tutorial.guideSeen[guideId] = true;
      saveToStorage(false);
    }

    function advanceTutorialAfterGuide(guideId) {
      markGuideSeen(guideId);
      const taskMap = {
        introStart: 'inspectGuiyang',
        liubiao: 'visitLiuBiao',
        inner: 'organizeRetinue',
        transfer: null,
        scheme: null,
        diplomacy: null
      };
      const nextTask = taskMap[guideId];
      if (nextTask) setTrackedTask(nextTask);
      gameState.activeModal = null;
      saveToStorage(false);
      render();
      // 处理队列中的后续 guide
      setTimeout(() => processGuideQueue(), 300);
    }

    function skipAllTutorial() {
      gameState.tutorial.skipped = true;
      gameState.tutorial.guideQueue = [];
      gameState.activeModal = null;
      // 解锁所有 tab
      ['liubiao', 'inner', 'transfer', 'scheme', 'diplomacy', 'characters', 'appointments'].forEach(tabId => {
        if (!gameState.tutorial.unlockedTabs.includes(tabId)) {
          gameState.tutorial.unlockedTabs.push(tabId);
        }
      });
      // 标记所有任务完成
      gameState.tutorial.tasks.forEach(task => { task.completed = true; });
      gameState.tutorial.trackedTaskId = null;
      saveToStorage(false);
      openNextCriticalModal();
      render();
    }

    // ===== 强制新手引导系统 =====
    function isGuideActive() {
      return gameState.tutorial && gameState.tutorial.guidePhase > 0 && !gameState.tutorial.guideCompleted;
    }

    function isForceAction(type, target) {
      const fa = gameState.tutorial.forceAction;
      if (!fa || fa.type !== type) return false;
      if (target !== undefined && fa.target !== target) return false;
      return true;
    }

    function checkForceAction(type, actualTarget) {
      if (!isGuideActive()) return false; // not blocking
      const fa = gameState.tutorial.forceAction;
      if (!fa) return false;
      if (fa.type === type && (fa.target === undefined || fa.target === actualTarget || fa.target === '*')) {
        return false; // allowed
      }
      toast('请按照引导操作');
      return true; // blocked
    }

    function clearGuideHighlights() {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'tutorial-overlay-cutout');
      });
      document.querySelectorAll('.tutorial-tooltip').forEach(el => el.remove());
      document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
      document.querySelectorAll('.tutorial-svg-proxy').forEach(el => el.remove());
      document.querySelectorAll('.tutorial-html-proxy').forEach(el => el.remove());
      gameState.tutorial.highlightedElements = [];
    }

    function showGuideOverlay() {
      if (!document.querySelector('.tutorial-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.id = 'tutorialOverlay';
        overlay.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          // 非强制步骤或信息展示类步骤：点击遮罩即可推进
          if (isGuideActive() && (!gameState.tutorial.forceAction || gameState.tutorial.forceAction.type === 'clickAp')) {
            clearGuideHighlights();
            removeGuideOverlay();
            gameState.tutorial.forceAction = null;
            advanceGuideStep();
          }
        });
        document.body.appendChild(overlay);
      }
    }

    function removeGuideOverlay() {
      const overlay = document.getElementById('tutorialOverlay');
      if (overlay) overlay.remove();
    }

    function highlightGuideElement(selector, tooltipText, tooltipPosition) {
      const el = document.querySelector(selector);
      if (!el) return;
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
      el.classList.add('tutorial-highlight', 'tutorial-overlay-cutout');
      gameState.tutorial.highlightedElements.push(selector);
      createGuideHtmlProxy(el, selector);

      if (tooltipText) {
        const rect = el.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.id = 'tutorialTooltip';
        tooltip.textContent = tooltipText;
        if (tooltipPosition === 'left') {
          tooltip.style.left = Math.max(10, rect.left - 340) + 'px';
        } else if (tooltipPosition === 'top') {
          tooltip.style.left = Math.max(10, rect.left) + 'px';
          tooltip.style.top = Math.max(10, rect.top - 100) + 'px';
        } else {
          tooltip.style.left = Math.min(window.innerWidth - 340, rect.right + 10) + 'px';
        }
        if (!tooltipPosition || tooltipPosition !== 'top') {
          tooltip.style.top = Math.max(10, rect.top + rect.height / 2 - 40) + 'px';
        }
        document.body.appendChild(tooltip);
      }

      showGuideOverlay();
    }

    function createGuideHtmlProxy(target, selector) {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const proxy = document.createElement('button');
      proxy.type = 'button';
      proxy.className = 'tutorial-html-proxy';
      proxy.setAttribute('aria-label', '执行引导目标操作');
      proxy.dataset.guideProxySelector = selector;
      proxy.style.left = Math.max(0, rect.left - 4) + 'px';
      proxy.style.top = Math.max(0, rect.top - 4) + 'px';
      proxy.style.width = Math.min(window.innerWidth - Math.max(0, rect.left - 4), rect.width + 8) + 'px';
      proxy.style.height = Math.min(window.innerHeight - Math.max(0, rect.top - 4), rect.height + 8) + 'px';
      proxy.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        // 非强制步骤或信息展示类步骤：点击任意位置推进引导
        if (isGuideActive() && (!gameState.tutorial.forceAction || gameState.tutorial.forceAction.type === 'clickAp')) {
          clearGuideHighlights();
          removeGuideOverlay();
          gameState.tutorial.forceAction = null;
          advanceGuideStep();
          return;
        }
        const liveTarget = document.querySelector(selector);
        if (!liveTarget || liveTarget.disabled || liveTarget.getAttribute('aria-disabled') === 'true') {
          toast('当前引导目标暂不可用');
          return;
        }
        liveTarget.click();
      });
      document.body.appendChild(proxy);
    }

    function highlightGuideSvgElement(selector, tooltipText, tooltipPosition) {
      // Use getElementById for SVG parent to avoid querying HTML elements with same attributes
      let el = null;
      const idMatch = selector.match(/^#(\w+)\s+(.+)$/);
      if (idMatch) {
        const parent = document.getElementById(idMatch[1]);
        if (parent) el = parent.querySelector(idMatch[2]);
      }
      if (!el) el = document.querySelector(selector);
      if (!el) return;
      // If the element is a <g> group, highlight the main visual child (circle) instead
      let highlightEl = el;
      if (el.tagName.toLowerCase() === 'g') {
        const core = el.querySelector('circle.city-core');
        if (core) highlightEl = core;
      }
      highlightEl.classList.add('tutorial-highlight', 'tutorial-overlay-cutout');
      gameState.tutorial.highlightedElements.push(selector);

      // SVG elements can't break through the HTML overlay via z-index,
      // so create a floating clickable proxy div positioned over the SVG element.
      const rect = highlightEl.getBoundingClientRect();
      const proxy = document.createElement('div');
      proxy.className = 'tutorial-svg-proxy';
      proxy.id = 'tutorialSvgProxy';
      proxy.style.cssText = `position:fixed;z-index:9001;cursor:pointer;
        left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;
        border-radius:50%;`;
      // Extract cityId from the element or its parent group
      const cityId = el.getAttribute('data-select-city') || el.closest('[data-select-city]')?.getAttribute('data-select-city');
      // Forward clicks on the proxy to the actual game logic
      proxy.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const hasForce = gameState.tutorial && gameState.tutorial.forceAction;
        if (cityId && (isGuideActive() || hasForce)) {
          if (checkForceAction('clickCity', cityId)) return;
          selectCity(cityId, 'city');
          if (isForceAction('clickCity', cityId)) {
            gameState.activePanel = 'city';
            clearGuideHighlights();
            removeGuideOverlay();
            gameState.tutorial.forceAction = null;
            advanceGuideStep();
          }
        }
      });
      document.body.appendChild(proxy);

      if (tooltipText) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.id = 'tutorialTooltip';
        tooltip.textContent = tooltipText;
        if (tooltipPosition === 'left') {
          tooltip.style.left = Math.max(10, rect.left - 340) + 'px';
        } else if (tooltipPosition === 'top') {
          tooltip.style.left = Math.max(10, rect.left) + 'px';
          tooltip.style.top = Math.max(10, rect.top - 100) + 'px';
        } else {
          tooltip.style.left = Math.min(window.innerWidth - 340, rect.right + 10) + 'px';
        }
        if (!tooltipPosition || tooltipPosition !== 'top') {
          tooltip.style.top = Math.max(10, rect.top + rect.height / 2 - 40) + 'px';
        }
        document.body.appendChild(tooltip);
      }

      showGuideOverlay();
    }

    function setForceAction(type, target) {
      gameState.tutorial.forceAction = { type, target };
    }

    function advanceGuideStep() {
      clearGuideHighlights();
      // Phase-specific step advancement
      const phase = gameState.tutorial.guidePhase;
      const stepKey = 'guideStep_' + phase;
      if (!gameState.tutorial._stepIndex) gameState.tutorial._stepIndex = {};
      const currentStep = gameState.tutorial._stepIndex[phase] || 0;
      gameState.tutorial._stepIndex[phase] = currentStep + 1;
      processGuidePhase();
    }

    function initTutorialGuide() {
      gameState.activeModal = { type: 'tutorialStartChoice' };
      render();
    }

    function startForceGuide() {
      gameState.tutorial.skipped = false;
      gameState.tutorial.guidePhase = 1;
      gameState.tutorial.forceAction = null;
      gameState.tutorial.highlightedElements = [];
      gameState.tutorial.guideCompleted = false;
      gameState.tutorial._stepIndex = {};
      // 快照引导前的游戏状态，引导结束后还原
      const regionControllers = {};
      if (mapData && mapData.regions) {
        Object.entries(mapData.regions).forEach(([id, r]) => {
          regionControllers[id] = { controller: r.controller, faction: r.faction };
        });
      }
      gameState.tutorial._guideSnapshot = {
        cities: JSON.parse(JSON.stringify(gameState.cities)),
        player: JSON.parse(JSON.stringify(gameState.player)),
        characterRoster: JSON.parse(JSON.stringify(gameState.characterRoster)),
        orders: JSON.parse(JSON.stringify(gameState.orders)),
        letters: JSON.parse(JSON.stringify(gameState.letters)),
        armies: JSON.parse(JSON.stringify(gameState.armies)),
        campaigns: JSON.parse(JSON.stringify(gameState.campaigns || [])),
        turnEvents: JSON.parse(JSON.stringify(gameState.turnEvents || [])),
        news: JSON.parse(JSON.stringify(gameState.news || [])),
        regionControllers
      };
      // 引导期间暂时隐藏密令入匣信件，引导结束后恢复
      const plotLetter = gameState.letters.find(item => item.meta?.nodeId === 'lb_1_1' && !item.resolved);
      if (plotLetter) plotLetter.read = true;
      // 临时解锁后续需要的tab
      ['liubiao', 'inner', 'transfer', 'scheme', 'diplomacy', 'characters', 'appointments'].forEach(tabId => {
        if (!gameState.tutorial.unlockedTabs.includes(tabId)) {
          gameState.tutorial.unlockedTabs.push(tabId);
        }
      });
      updateTabLockStates();
      processGuidePhase();
    }

    function restoreGuideSnapshot() {
      const snap = gameState.tutorial._guideSnapshot;
      if (!snap) return;
      // 先还原 mapData region 的控制权，再同步到 cities
      if (snap.regionControllers && mapData && mapData.regions) {
        Object.entries(snap.regionControllers).forEach(([id, saved]) => {
          const r = mapData.regions[id];
          if (r) { r.controller = saved.controller; r.faction = saved.faction; }
        });
      }
      gameState.cities = snap.cities;
      gameState.player = snap.player;
      gameState.characterRoster = snap.characterRoster;
      gameState.orders = snap.orders;
      gameState.letters = snap.letters;
      gameState.armies = snap.armies;
      gameState.campaigns = snap.campaigns;
      gameState.turnEvents = snap.turnEvents;
      gameState.news = snap.news;
      gameState.tutorial._guideSnapshot = null;
      syncMapDataFromGameState();
    }

    function skipForceGuide() {
      restoreGuideSnapshot();
      clearGuideHighlights();
      removeGuideOverlay();
      gameState.tutorial.guidePhase = 0;
      gameState.tutorial.guideCompleted = true;
      gameState.tutorial.forceAction = null;
      gameState.tutorial.skipped = true;
      gameState.tutorial.guideQueue = [];
      gameState.activeModal = null;
      // 解锁所有 tab
      ['liubiao', 'inner', 'transfer', 'scheme', 'diplomacy', 'characters', 'appointments'].forEach(tabId => {
        if (!gameState.tutorial.unlockedTabs.includes(tabId)) {
          gameState.tutorial.unlockedTabs.push(tabId);
        }
      });
      // 标记所有任务完成
      gameState.tutorial.tasks.forEach(task => { task.completed = true; });
      gameState.tutorial.trackedTaskId = null;
      updateTabLockStates();
      saveToStorage(false);
      openNextCriticalModal();
      render();
    }

    function processGuidePhase() {
      clearGuideHighlights();
      const phase = gameState.tutorial.guidePhase;
      if (phase === 0 || gameState.tutorial.guideCompleted) return;
      render();
      // Delay to let DOM settle after render
      setTimeout(() => {
        switch (phase) {
          case 1: setupPhase1(); break;
          case 2: setupPhase2(); break;
          case 3: setupPhase3(); break;
          case 4: setupPhase4(); break;
          case 5: setupPhase5(); break;
          default: completeGuide(); break;
        }
      }, 150);
    }

    function endGuideTurn() {
      // Simplified turn settlement for guide mode: process orders but don't advance turn/date
      const reports = [];
      processOrders(reports);
      unlockTabsByTutorialProgress();
      reports.forEach(item => { addNews(item.tone, item.text); });
      gameState.orders = [];
      resetActionPoints();
      saveToStorage(false);
      // Advance to next phase
      gameState.tutorial.guidePhase += 1;
      gameState.tutorial._stepIndex = {};
      gameState.tutorial.forceAction = null;
      // If we've advanced past the last guide phase, complete immediately
      if (gameState.tutorial.guidePhase > 5) {
        completeGuide();
      } else {
        processGuidePhase();
      }
    }

    function completeGuide() {
      restoreGuideSnapshot();
      clearGuideHighlights();
      removeGuideOverlay();
      gameState.tutorial.guideCompleted = true;
      gameState.tutorial.guidePhase = 0;
      gameState.tutorial.forceAction = null;
      gameState.tutorial._stepIndex = {};
      // 标记所有任务完成
      gameState.tutorial.tasks.forEach(task => { task.completed = true; });
      gameState.tutorial.trackedTaskId = null;
      // 确保所有tab解锁
      ['liubiao', 'inner', 'transfer', 'scheme', 'diplomacy', 'characters', 'appointments'].forEach(tabId => {
        if (!gameState.tutorial.unlockedTabs.includes(tabId)) {
          gameState.tutorial.unlockedTabs.push(tabId);
        }
      });
      updateTabLockStates();
      saveToStorage(false);
      gameState.activeModal = {
        type: 'guideComplete',
        title: '新手引导完成',
        text: '新手引导已经完成，现在开始你的乱世执棋吧！'
      };
      render();
    }

    function getGuideStepIndex(phase) {
      if (!gameState.tutorial._stepIndex) gameState.tutorial._stepIndex = {};
      return gameState.tutorial._stepIndex[phase] || 0;
    }

    // ===== 各阶段设置函数 =====

    function setupPhase1() {
      const step = getGuideStepIndex(1);
      switch (step) {
        case 0: // 高亮桂阳城
          setForceAction('clickCity', 'guiyang');
          focusMapOnCity('guiyang');
          setTimeout(() => {
            highlightGuideSvgElement('#cityLayer [data-select-city="guiyang"]', '请点击桂阳城，查看人口、驻军与粮食概况', 'top');
          }, 200);
          return;
        case 1: // 高亮征兵按钮
          gameState.activePanel = 'city';
          setForceAction('cityOrder', 'recruit');
          highlightGuideElement('[data-city-order="recruit"]', '点击征兵扩充兵力。税率/征粮可通过滑块调整', 'left');
          break;
        case 2: // 高亮政务点，说明城政消耗规则
          gameState.activePanel = 'city';
          setForceAction('clickAp');
          highlightGuideElement('[data-ap="gov"]', '每个城政命令会消耗一个政务点数', 'left');
          break;
        case 3: // 切到军事面板
          gameState.activePanel = 'military';
          render();
          setTimeout(() => {
            setForceAction('clickTab', 'military');
            highlightGuideElement('[data-tab="military"]', '切换到军事面板，整备防务');
          }, 100);
          return; // skip default flow
        case 4: // 高亮整军按钮
          setForceAction('militaryOrder', 'drill');
          highlightGuideElement('[data-military-order="drill"]', '整军提升士气，悬停可查看代价和收益', 'left');
          break;
        case 5: // 高亮军令点，说明军事消耗规则
          setForceAction('clickAp');
          highlightGuideElement('[data-ap="mil"]', '每个军事整备命令消耗一个军令点数', 'left');
          break;
        case 6: // 高亮结束回合
          setForceAction('endTurn', 'endTurn');
          highlightGuideElement('[data-end-turn="1"]', '点击结束回合，结算本回合命令', 'left');
          break;
        default:
          endGuideTurn();
          return;
      }
      saveToStorage(false);
    }

    function setupPhase2() {
      const step = getGuideStepIndex(2);
      switch (step) {
        case 0: // 高亮部署进攻卡片
          gameState.activePanel = 'military';
          render();
          setTimeout(() => {
            highlightGuideElement('[data-military-section="attackPlanner"]', '可以设置出兵城和目标城', 'left');
          }, 100);
          return;
        case 1: // 强制点击进入详细部署
          setForceAction('startAttackPlan');
          highlightGuideElement('[data-start-attack-plan="1"]', '点击进入详细部署', 'left');
          break;
        case 2: // 高亮详细部署面板（信息展示）
          highlightGuideElement('.card:has([data-draft-field="tactic"])', '可以设置参战兵力、出兵路线、战术方案和作战目标', 'left');
          break;
        case 3: // 强制点击加入本回合军令
          setForceAction('queueBattle');
          highlightGuideElement('[data-queue-battle="1"]', '点击加入本回合军令', 'left');
          break;
        case 4: // 高亮军令点，说明军事部署消耗
          setForceAction('clickAp');
          highlightGuideElement('[data-ap="mil"]', '一次军事部署消耗两个军令点数', 'left');
          break;
        case 5: // 刘表tab
          setForceAction('clickTab', 'liubiao');
          highlightGuideElement('[data-tab="liubiao"]', '刘表是你的庇护者，查看密令');
          break;
        case 6: // 上报桂阳局势
          setForceAction('liubiaoAction', 'report');
          highlightGuideElement('[data-liubiao-action="report"]', '可以查看详情', 'left');
          break;
        case 7: // 高亮外交点（信息展示）
          highlightGuideElement('[data-ap="dip"]', '每个选项消耗1个外交点数', 'left');
          break;
        case 8: // 刘表庇护HUD（信息展示）
          highlightGuideElement('[data-help-key="protectionHelp"]', '可以悬浮查看', 'left');
          break;
        case 9: // 结束回合
          setForceAction('endTurn', 'endTurn');
          highlightGuideElement('[data-end-turn="1"]', '点击结束回合以推进时间', 'left');
          break;
        default:
          endGuideTurn();
          return;
      }
      saveToStorage(false);
    }

    function setupPhase3() {
      const step = getGuideStepIndex(3);
      switch (step) {
        case 0: // 亲信tab
          setForceAction('clickTab', 'inner');
          highlightGuideElement('[data-tab="inner"]', '亲信决定你能否掌控府衙、粮道与情报', 'top');
          break;
        case 1: // 整肃亲兵
          setForceAction('clickInner', 'organize');
          highlightGuideElement('[data-inner-action="organize"]', '整肃亲兵提升内部忠诚，悬停查看利弊', 'left');
          break;
        case 2: // 人物tab
          setForceAction('clickTab', 'characters');
          highlightGuideElement('[data-tab="characters"]', '点击查看人物列表', 'top');
          break;
        case 3: // 刘表人物卡片（强制高亮点击）
          setForceAction('clickCharacter', 'liuBiao');
          highlightGuideElement('[data-open-character-profile="liuBiao"]', '请点击刘表，查看详细属性与关系', 'left');
          break;
        case 4: // 会谈按钮（强制高亮点击）
          setForceAction('clickConversation', 'talk');
          highlightGuideElement('[data-conversation="talk"]', '请点击会谈，提升信任和关系', 'left');
          break;
        // 结束回合步骤在对话弹窗关闭后自动触发（见 closeActiveModal）
        default:
          endGuideTurn();
          return;
      }
      saveToStorage(false);
    }

    function setupPhase4() {
      // 前提：确保玩家控制至少2座城
      const playerCities = Object.values(gameState.cities).filter(c => c.controller === 'player');
      if (playerCities.length < 2) {
        captureRegion('changsha', 'player', null, { render: false, select: false, skipProtectionDecay: true });
        addNews('good', '长沙已归入你的控制。');
      }
      const step = getGuideStepIndex(4);
      switch (step) {
        case 0: // 调兵tab
          setForceAction('clickTab', 'transfer');
          highlightGuideElement('[data-tab="transfer"]', '拥有两座城后可调配兵力', 'top');
          break;
        case 1: // 调兵说明弹窗
          gameState.activePanel = 'transfer';
          saveToStorage(false);
          render();
          setTimeout(() => {
            gameState.activeModal = {
              type: 'eventDetail',
              title: '调兵说明',
              text: '当你同时拥有两座以上的城池后，可以将其中一个城的兵力调到另一座城。'
            };
            render();
          }, 200);
          return; // after closing modal, advance to step 2
        case 2: // 外交tab
          setForceAction('clickTab', 'diplomacy');
          highlightGuideElement('[data-tab="diplomacy"]', '外交用于结盟、借道、示好', 'top');
          break;
        case 3: // 纳粮
          setForceAction('clickDiplomacy', 'demandFood');
          highlightGuideElement('[data-diplomacy-action="demandFood"]', '纳粮可向周边势力征收粮草', 'left');
          break;
        case 4: // 结束回合
          setForceAction('endTurn', 'endTurn');
          highlightGuideElement('[data-end-turn="1"]', '结束回合结算', 'left');
          break;
        default:
          endGuideTurn();
          return;
      }
      saveToStorage(false);
    }

    function setupPhase5() {
      const step = getGuideStepIndex(5);
      switch (step) {
        case 0: // 高亮豫章城
          setForceAction('clickCity', 'yuzhang');
          highlightGuideSvgElement('#cityLayer [data-select-city="yuzhang"]', '豫章是孙氏在荆南的门户', 'top');
          break;
        case 1: // 谋略tab
          setForceAction('clickTab', 'scheme');
          highlightGuideElement('[data-tab="scheme"]', '谋略可在战前改变局势', 'top');
          break;
        case 2: // 刺探豫章
          setForceAction('clickScheme', 'scout');
          highlightGuideElement('[data-scheme-action="scout"][data-target="yuzhang"]', '刺探可获取目标城兵力、城防和粮草信息', 'left');
          break;
        case 3: // 结束回合
          setForceAction('endTurn', 'endTurn');
          highlightGuideElement('[data-end-turn="1"]', '结束回合结算刺探结果', 'left');
          break;
        default:
          endGuideTurn();
          return;
      }
      saveToStorage(false);
    }

    // ===== 强制新手引导系统结束 =====
    function updateTabLockStates() {
      document.querySelectorAll('[data-tab]').forEach(btn => {
        const tabId = btn.getAttribute('data-tab');
        const locked = !isTabUnlocked(tabId);
        btn.classList.toggle('tab-locked', locked);
        btn.setAttribute('aria-disabled', locked ? 'true' : 'false');
        btn.setAttribute('data-locked', locked ? '1' : '0');
      });
    }

    function validateTutorialUnlocks() {
      const t = (id) => gameState.tutorial.tasks.find(task => task.id === id)?.completed || false;
      const network = gameState.characters?.retinue?.network ?? 0;
      const prestige = gameState.player?.prestige ?? 0;
      const protection = gameState.player?.protection ?? 0;
      const results = [];
      // transfer
      results.push({ tab: 'transfer', shouldUnlock: t('organizeRetinue'), isUnlocked: isTabUnlocked('transfer'), taskCompleted: t('unlockTransfer'), trackedTask: gameState.tutorial.trackedTaskId });
      // scheme
      results.push({ tab: 'scheme', shouldUnlock: t('organizeRetinue') && network >= 30, isUnlocked: isTabUnlocked('scheme'), network, taskCompleted: t('unlockScheme'), trackedTask: gameState.tutorial.trackedTaskId });
      // diplomacy
      results.push({ tab: 'diplomacy', shouldUnlock: t('organizeRetinue') && prestige >= 10 && protection >= 60, isUnlocked: isTabUnlocked('diplomacy'), prestige, protection, taskCompleted: t('unlockDiplomacy'), trackedTask: gameState.tutorial.trackedTaskId });
      // appointments
      results.push({ tab: 'appointments', shouldUnlock: t('visitLiuBiao'), isUnlocked: isTabUnlocked('appointments'), trackedTask: gameState.tutorial.trackedTaskId });
      console.table(results);
      return results;
    }

    function getGuideContent(guideId) {
      const guides = {
        introStart: {
          title: '你的第一步：稳住桂阳',
          body: `<p>你受刘表密令来到桂阳。这里不是你的私人领地，而是荆南门户。</p>
            <p>你现在最重要的目标<strong>不是争霸</strong>，而是先稳住桂阳。</p>
            <p>前期你只能使用<strong>【城政】</strong>和<strong>【军事】</strong>两个功能：</p>
            <ul>
              <li><strong>城政</strong>：稳定民心、治安、粮食和府库；</li>
              <li><strong>军事</strong>：出阵作战、整备防务、维持士气；练兵通过城政进行。</li>
            </ul>
            <p>等桂阳稳定后，<strong>刘表、亲信、调兵、谋略和外交</strong>会逐步解锁。</p>`,
          choices: [
            { id: 'accept', label: '明白，先看桂阳', action: 'accept' },
            { id: 'skip', label: '跳过新手引导', action: 'skipAll' }
          ]
        },
        cityMilitary: {
          title: '城政：先把桂阳稳住',
          body: `<p>城政不是单纯加数值。它决定桂阳能不能承受征兵、出兵和外部压力。</p>
            <ul>
              <li><strong>民心</strong>低会影响税收、征粮和兵源；</li>
              <li><strong>治安</strong>低会增加叛乱和豪强坐大的风险；</li>
              <li><strong>粮食</strong>和<strong>府库</strong>决定你能不能长期作战。</li>
            </ul>
            <p>军事不仅是进攻。前期军事的核心是<strong>整备防务、维持士气、补足守军</strong>；练兵请从城政下令。</p>
            <p>桂阳兵力不足时贸然出征，会导致本城空虚，也会降低刘表对你的信任。</p>`,
          choices: [
            { id: 'accept', label: '明白了，开始治理', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        },
        liubiao: {
          title: '刘表：你的庇护与限制',
          body: `<p>你不是独立诸侯。<strong>刘表是你的名义主君，也是你的保护伞。</strong></p>
            <p>刘表庇护越高，外部势力越不敢轻易攻击或离间你；但擅自扩张、过度征发或越权外交，会消耗这份庇护。</p>
            <div class="guide-options-list">
              <div class="guide-option-card">
                <div class="option-name">请求兵粮</div>
                <span class="pros">好处：快速获得粮草或资源，帮助桂阳度过前期。</span>
                <span class="cons">代价：可能消耗刘表信任或庇护，不能频繁使用。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">上报桂阳局势</div>
                <span class="pros">好处：维持刘表信任，提升合法性。</span>
                <span class="cons">代价：可能暴露你的真实实力和野心。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">表明忠心</div>
                <span class="pros">好处：提高庇护和信任，降低外部势力敌意。</span>
                <span class="cons">代价：短期不利于独立扩张路线。</span>
              </div>
            </div>`,
          choices: [
            { id: 'accept', label: '明白了', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        },
        inner: {
          title: '亲信：真正控制桂阳的人',
          body: `<p>城池不是只靠太守命令运转。<strong>亲兵、主簿、粮官、斥候</strong>决定你能否掌控府衙、粮道、军队和情报。</p>
            <p>亲信越强，后续谋略、调兵和外交越稳。</p>
            <div class="guide-options-list">
              <div class="guide-option-card">
                <div class="option-name">整肃亲兵</div>
                <span class="pros">好处：提升内部忠诚，降低叛变和被离间风险。</span>
                <span class="cons">代价：可能引起旧部不满。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">安插府衙亲信</div>
                <span class="pros">好处：提升府衙控制，减少政令阻力。</span>
                <span class="cons">代价：可能激怒地方郡吏和士族。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">掌握桂阳粮道</div>
                <span class="pros">好处：提高粮食调度能力，支撑出兵和围城。</span>
                <span class="cons">代价：可能触碰豪强利益。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">联络郡兵小校</div>
                <span class="pros">好处：提升军队掌控，后续调兵更稳定。</span>
                <span class="cons">代价：可能让刘表或地方势力警惕。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">扩展情报网络</div>
                <span class="pros">好处：解锁谋略系统，提高刺探、断粮、内应成功率。</span>
                <span class="cons">代价：需要时间和资源，可能暴露行动。</span>
              </div>
            </div>`,
          choices: [
            { id: 'accept', label: '明白了', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        },
        transfer: {
          title: '调兵：把兵送到该去的地方',
          body: `<p>调兵用于在你控制的城池之间移动兵力。它不是进攻，而是<strong>部署</strong>。</p>
            <ul>
              <li>调兵只能在<strong>己方可达城市</strong>之间进行；</li>
              <li>每座城必须保留<strong>最低守军</strong>；</li>
              <li>调兵会消耗<strong>军令点</strong>；</li>
              <li>调兵会影响后续进攻和防守；</li>
              <li><strong>不要把桂阳全部兵力调走。</strong></li>
            </ul>`,
          choices: [
            { id: 'accept', label: '明白了', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        },
        scheme: {
          title: '谋略：不靠硬打也能赢',
          body: `<p>谋略用于在<strong>战前改变局势</strong>。刺探可以提高战斗判断，破坏粮道可以削弱守军，联络内应可能打开城门。</p>
            <p>谋略不是直接替代战斗，而是<strong>让战斗更容易胜利</strong>。</p>
            <div class="guide-options-list">
              <div class="guide-option-card">
                <div class="option-name">刺探</div>
                <span class="pros">好处：获得目标兵力、城防和粮草信息，提高进攻判断。</span>
                <span class="cons">代价：失败会提高对方警惕。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">破坏粮道</div>
                <span class="pros">好处：降低敌方粮草和士气，适合围城前使用。</span>
                <span class="cons">代价：失败可能暴露你的敌意。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">联络内应</div>
                <span class="pros">好处：可能降低城防，甚至触发快速破城机会。</span>
                <span class="cons">代价：难度较高，需要情报网络支持。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">散布疑阵 / 伪造调令</div>
                <span class="pros">好处：扰乱敌方部署，降低援军效率或守军士气。</span>
                <span class="cons">代价：如果失败，会提升对方戒备。</span>
              </div>
            </div>
            <p>下一步：选择一个相邻目标，先刺探，再考虑进攻。</p>`,
          choices: [
            { id: 'accept', label: '明白了', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        },
        diplomacy: {
          title: '外交：不是所有问题都要靠打',
          body: `<p>外交用于与周边势力、豪强、士族或其他诸侯建立关系。</p>
            <p>弱城可以打，强敌可以暂时<strong>结盟、借道、求援或拉拢</strong>。贸然外交也可能影响刘表庇护。</p>
            <div class="guide-options-list">
              <div class="guide-option-card">
                <div class="option-name">结盟</div>
                <span class="pros">好处：降低被攻击风险，为扩张争取时间。</span>
                <span class="cons">代价：可能限制你攻击盟友，也可能被卷入对方战争。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">借道</div>
                <span class="pros">好处：允许军队通过非己方地盘。</span>
                <span class="cons">代价：失败会损害关系，强行通过会增加敌意。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">示好 / 送礼</div>
                <span class="pros">好处：提升关系，打开谈判空间。</span>
                <span class="cons">代价：消耗府库，不一定立刻有回报。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">威慑</div>
                <span class="pros">好处：逼迫弱小势力让步。</span>
                <span class="cons">代价：增加敌意，可能损害名声。</span>
              </div>
              <div class="guide-option-card">
                <div class="option-name">求援</div>
                <span class="pros">好处：在危机时获得支援。</span>
                <span class="cons">代价：欠下人情，降低自主性。</span>
              </div>
            </div>`,
          choices: [
            { id: 'accept', label: '明白了', action: 'accept' },
            { id: 'skip', label: '跳过', action: 'skipAll' }
          ]
        }
      };
      return guides[guideId] || null;
    }

    function renderGuideModal(guideId) {
      const guide = getGuideContent(guideId);
      if (!guide) return '';
      const choices = guide.choices || [];
      return `<div class="tutorial-guide-modal">
        <div class="guide-header">
          <h2>${guide.title}</h2>
        </div>
        <div class="guide-body">${guide.body}</div>
        <div class="guide-footer">
          ${choices.map(ch => {
            if (ch.action === 'skipAll') return `<button class="btn-skip" data-skip-tutorial="1">${ch.label}</button>`;
            return `<button data-tutorial-guide-choice="${guideId}" data-guide-action="${ch.action}">${ch.label}</button>`;
          }).join('')}
          <button class="ghost-btn" data-close-modal="1" style="flex:0 0 auto;min-width:60px;">✕</button>
        </div>
      </div>`;
    }

    function renderTutorialTaskBar() {
      const taskId = gameState.tutorial.trackedTaskId;
      if (!taskId || gameState.tutorial.skipped) return '';
      const task = getTutorialTask(taskId);
      if (!task) return '';
      if (task.completed) {
        const next = getDefaultTrackedTask();
        if (next) setTrackedTask(next);
        return renderTutorialTaskBar();
      }
      return `<div class="tracked-task-card">
        <h4>📋 当前目标</h4>
        <div class="task-label">${task.label}</div>
        <div class="task-hint">${task.description}</div>
        ${task.nextHint ? `<div class="task-hint" style="color:var(--gold-soft);margin-top:2px;">→ ${task.nextHint}</div>` : ''}
        <div class="task-btn-row">
          <button data-open-task-drawer="1">查看全部任务</button>
        </div>
      </div>`;
    }

    function renderTaskDrawer() {
      const tasks = gameState.tutorial.tasks;
      const unlockConds = [];
      // 汇总解锁条件（与 unlockTabsByTutorialProgress 一致）
      const t = (id) => getTutorialTask(id)?.completed || false;
      if (!isTabUnlocked('liubiao')) unlockConds.push({ label: '刘表', condition: '完成一次城政 + 一次军事调整', met: t('firstCityOrder') && t('firstMilitaryOrder') });
      if (!isTabUnlocked('inner')) unlockConds.push({ label: '亲信', condition: '查看刘表密令', met: t('visitLiuBiao') });
      if (!isTabUnlocked('appointments')) unlockConds.push({ label: '任命', condition: '人物系统解锁后开放', met: t('visitLiuBiao') });
      if (!isTabUnlocked('transfer')) unlockConds.push({ label: '调兵', condition: '整肃亲信班底', met: t('organizeRetinue') });
      if (!isTabUnlocked('scheme')) unlockConds.push({ label: '谋略', condition: '亲信情报网络 ≥ 30（当前：' + gameState.characters.retinue.network + '）', met: gameState.characters.retinue.network >= 30 });
      if (!isTabUnlocked('diplomacy')) unlockConds.push({ label: '外交', condition: '声望 ≥ 10（当前：' + gameState.player.prestige + '）且刘表庇护 ≥ 60（当前：' + Math.round(gameState.player.protection) + '）', met: gameState.player.prestige >= 10 && gameState.player.protection >= 60 });

      return `<div class="task-drawer-overlay" data-close-task-drawer="1">
        <div class="task-drawer" onclick="event.stopPropagation()">
          <h3>📋 第一阶段：稳定桂阳</h3>
          ${tasks.map(task => {
            const checked = task.completed ? '✅' : '⬜';
            const cls = task.completed ? 'completed' : '';
            return `<div class="task-item ${cls}">
              <span class="task-check">${checked}</span>
              <span class="task-desc">${task.label}</span>
              <span class="task-next">${task.completed ? '已完成' : ''}</span>
            </div>`;
          }).join('')}
          ${unlockConds.length ? `<div class="task-unlock-conditions">
            <h4>🔓 功能解锁条件</h4>
            ${unlockConds.map(uc => `<div class="unlock-item ${uc.met ? 'unlocked' : ''}">${uc.met ? '✅' : '🔒'} ${uc.label}：${uc.condition}</div>`).join('')}
          </div>` : ''}
          <div class="button-grid" style="margin-top:12px;">
            <button data-close-task-drawer="1">关闭</button>
            <button class="btn-skip" data-skip-tutorial="1">跳过全部引导</button>
          </div>
        </div>
      </div>`;
    }

    // ===================== 长悬停 tooltip =====================
    const HELP_TEXT = {
      turnDateHelp: getTurnDateHelpText,
      currentGoalHelp: getCurrentGoalHelpText,
      protectionHelp: '<strong>刘表庇护</strong><br>代表刘表名义上给予你的背书与保护。<br><span style="color:var(--good)">数值越高，外部势力越不敢轻易攻击、离间或试探桂阳；外交也更容易解锁。</span><br><span style="color:var(--bad)">擅自扩张、越权外交、隐瞒军备或荆南士族疑心过高，都会消耗这份庇护。</span>',
      gentrySuspicionHelp: '<strong>士族疑心</strong><br>代表荆南士族对你是否守礼、守信、能安民的怀疑程度。<br><span style="color:var(--good)">疑心越低，士族更愿意荐才、维持清议支持，地方局势更稳。</span><br><span style="color:var(--bad)">疑心过高会带来流言、观望与掣肘，并可能拖累刘表庇护。</span>',
      plagueHelp: '<strong>疫病</strong><br>剧情模式中的低概率灾变压力。<br><span style="color:var(--good)">医者、民心、治安、充足粮草和及时处置会降低扩散。</span><br><span style="color:var(--bad)">围城、战损、缺粮、隐瞒疫情和治安崩坏会让疫病恶化，并牵动人物救赎线。</span>',
      'cityOrder:recruit': '<strong>征兵</strong><br><span style="color:var(--good)">好处：快速增加兵力，补充守军和可调兵力。</span><br><span style="color:var(--bad)">代价：可能降低民心，并增加粮食压力。</span><br>消耗 1 政务点',
      'cityOrder:train': '<strong>练兵</strong><br><span style="color:var(--good)">好处：提升军队战斗力，为后续调兵和进攻做准备。</span><br><span style="color:var(--bad)">代价：消耗粮食和府库，短期不能直接扩张。</span><br>消耗 1 政务点',
      'cityOrder:fortify': '<strong>修城防</strong><br><span style="color:var(--good)">好处：提高防守能力，敌军来攻时更稳。</span><br><span style="color:var(--bad)">代价：消耗府库和劳力。</span><br>消耗 1 政务点',
      'cityOrder:tuntian': '<strong>屯田</strong><br><span style="color:var(--good)">好处：提高粮食产出，适合长期作战。</span><br><span style="color:var(--bad)">代价：短期见效慢，可能占用劳力。</span><br>消耗 1 政务点',
      'cityOrder:relief': '<strong>赈济</strong><br><span style="color:var(--good)">好处：提升民心，减少不满。</span><br><span style="color:var(--bad)">代价：消耗粮食和府库。</span><br>消耗 1 政务点',
      'cityOrder:security': '<strong>整顿治安</strong><br><span style="color:var(--good)">好处：提升治安，降低豪强作乱和内乱风险。</span><br><span style="color:var(--bad)">代价：短期消耗府库，可能激怒地方豪强。</span><br>消耗 1 政务点'
    };
    let tooltipState = { timer: null, visible: false, el: null };

    function initTooltip() {
      if (tooltipState.el) return;
      const el = document.createElement('div');
      el.className = 'help-tooltip';
      el.id = 'helpTooltip';
      document.body.appendChild(el);
      tooltipState.el = el;
    }

    function showTooltip(text, x, y) {
      initTooltip();
      tooltipState.el.innerHTML = text;
      tooltipState.el.style.visibility = 'visible';
      tooltipState.el.style.left = x + 'px';
      tooltipState.el.style.top = y + 'px';
      tooltipState.el.classList.add('show');
      tooltipState.visible = true;
    }

    function showTooltipForTarget(text, target) {
      initTooltip();
      tooltipState.el.innerHTML = text;
      tooltipState.el.style.visibility = 'hidden';
      tooltipState.el.style.left = '0px';
      tooltipState.el.style.top = '0px';
      tooltipState.el.classList.add('show');

      const rect = target.getBoundingClientRect();
      const preferred = target.getAttribute('data-tooltip-position')
        || (target.getAttribute('data-tab') === 'liubiao' ? 'right' : 'bottom');
      const margin = 10;
      const width = tooltipState.el.offsetWidth || 280;
      const height = tooltipState.el.offsetHeight || 80;
      let left = rect.left;
      let top = rect.bottom + 6;

      if (preferred === 'right') {
        left = rect.right + margin;
        top = rect.top + rect.height / 2 - height / 2;
        if (left + width > window.innerWidth - margin) {
          left = rect.left - width - margin;
        }
      } else if (preferred === 'left') {
        left = rect.left - width - margin;
        top = rect.top + rect.height / 2 - height / 2;
      } else if (preferred === 'top') {
        left = rect.left;
        top = rect.top - height - 6;
      } else if (top + height > window.innerHeight - margin) {
        top = rect.top - height - 6;
      }

      left = clamp(left, margin, Math.max(margin, window.innerWidth - width - margin));
      top = clamp(top, margin, Math.max(margin, window.innerHeight - height - margin));
      tooltipState.el.style.left = left + 'px';
      tooltipState.el.style.top = top + 'px';
      tooltipState.el.style.visibility = 'visible';
      tooltipState.visible = true;
    }

    function hideTooltip() {
      clearTimeout(tooltipState.timer);
      tooltipState.timer = null;
      if (tooltipState.el) {
        tooltipState.el.classList.remove('show');
        tooltipState.visible = false;
      }
    }

    function handleHelpHover(event) {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest('[data-help], [data-help-key]');
      if (!target) {
        hideTooltip();
        return;
      }
      const key = target.getAttribute('data-help-key');
      const helper = key ? HELP_TEXT[key] : target.getAttribute('data-help');
      const text = typeof helper === 'function' ? helper() : helper;
      if (!text) { hideTooltip(); return; }
      clearTimeout(tooltipState.timer);
      tooltipState.timer = setTimeout(() => {
        showTooltipForTarget(text, target);
      }, 1000);
    }

    function toast(text) {
      const el = document.getElementById('toast');
      el.textContent = text;
      el.classList.add('show');
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;')
        .replace(/\//g, '&#47;');
    }

    function repairDisplayText(value) {
      const text = decodeDisplayEntities(String(value || '').trim());
      if (!text) return '';
      if (!looksLikeMojibake(text)) return text;

      const replacements = [
        ['鍒樿〃', '刘表'],
        ['鍓ф儏', '剧情'],
        ['鐩爣', '目标'],
        ['妗傞槼', '桂阳'],
        ['瑗勯槼', '襄阳'],
        ['鑽嗗窞', '荆州'],
        ['鍩庢睜', '城池'],
        ['绾垮', '线'],
        ['瀹岀粨', '完结'],
        ['杩涘叆', '进入'],
        ['鑷敱', '自由'],
        ['搴囨姢', '庇护'],
        ['淇′换', '信任'],
        ['澹版湜', '声望'],
        ['鍚堟硶鎬', '合法性'],
        ['鍥炲悎', '回合'],
        ['浣犻', '你'],
        ['浣犲', '你'],
        ['銆', '。'],
        ['锛', '，'],
        ['锝', '｜']
      ];
      let repaired = text;
      replacements.forEach(([from, to]) => {
        repaired = repaired.split(from).join(to);
      });
      repaired = repaired
        .replace(/[?？]{2,}/g, '？')
        .replace(/\s+/g, ' ')
        .trim();
      return looksLikeMojibake(repaired)
        ? '旧版本记忆：原文编码损坏，已隐藏乱码。'
        : repaired;
    }

    function looksLikeMojibake(value) {
      const text = String(value || '');
      const hits = (text.match(/鍒|鍓|鐩|绾|搴|妗|槼|瑗|鑽|荆|銆|锛|锝|||||/g) || []).length;
      return hits >= 2 || /�/.test(text);
    }

    function decodeDisplayEntities(value) {
      return String(value || '')
        .replace(/&amp;quot;/g, '"')
        .replace(/&amp;apos;/g, "'")
        .replace(/&amp;#34;/g, '"')
        .replace(/&amp;#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&#x22;/gi, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&amp;/g, '&');
    }

    function toggleCalibrationMode() {
      calibrationState.enabled = false;
      toast('正式游戏已改用 map-editor.html 标定数据');
      renderMap();
    }

    function exportMapDataJson() {
      syncMapDataFromGameState();
      const json = JSON.stringify(mapData, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).catch(() => {});
      }
      document.getElementById('rightTitle').textContent = '地图校准 JSON';
      document.getElementById('rightTag').textContent = calibrationState.selectedRegionId || 'mapData';
      document.getElementById('rightPanel').innerHTML = `
        <div class="card">
          <h2>已导出 mapData</h2>
          <p>若浏览器允许，JSON 已写入剪贴板。也可以在这里查看当前北方战区 region polygon。</p>
          <textarea style="width:100%;height:420px;background:#120d09;color:#ffe8ae;border:1px solid rgba(255,230,160,.25);border-radius:8px;padding:10px;font-size:12px">${escapeHtml(json)}</textarea>
        </div>
      `;
      toast('mapData JSON 已生成');
    }

    function showIntroPlayButton(label = '播放开场', fallback = false) {
      const button = document.getElementById('introPlay');
      if (!button) return;
      button.textContent = label;
      button.dataset.introFallback = fallback ? '1' : '0';
      button.classList.add('show');
    }

    function hideIntroPlayButton() {
      document.getElementById('introPlay')?.classList.remove('show');
    }

    function playIntroVideo() {
      const video = document.getElementById('introVideo');
      if (!video) return;
      pauseBgm(); // 进入动画时暂停背景音乐
      const intro = document.getElementById('intro');
      if (intro) intro.classList.add('is-loading');
      const start = () => {
        if (intro) intro.classList.remove('is-loading');
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') {
          playback
            .then(hideIntroPlayButton)
            .catch(() => showIntroPlayButton());
        }
      };
      whenMediaReady(video, start);
    }

    function stopIntroVideo() {
      const video = document.getElementById('introVideo');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      document.getElementById('intro')?.classList.remove('is-loading');
      hideIntroPlayButton();
    }

    function stopOpeningTransition() {
      if (openingTransitionTimer) clearTimeout(openingTransitionTimer);
      openingTransitionTimer = null;
      document.getElementById('openingTransition')?.classList.remove('playing');
    }

    function stopOfficeHandoffTransition() {
      if (officeHandoffTimer) clearTimeout(officeHandoffTimer);
      officeHandoffTimer = null;
    }

    function completeOpeningTransition() {
      if (openingTransitionTimer) clearTimeout(openingTransitionTimer);
      openingTransitionTimer = null;
      document.getElementById('openingTransition')?.classList.remove('playing');
      if (openingTransitionMode === 'departure') {
        startNewCharacter({ delayGuide: true });
        return;
      }
      characterCreationStep = 'arrival';
      launchScreen = 'character';
      render();
    }

    function beginOfficeHandoffTransition() {
      stopOfficeHandoffTransition();
      launchScreen = 'handoff';
      render();
      officeHandoffTimer = setTimeout(() => {
        officeHandoffTimer = null;
        startNewCharacter({ delayGuide: true });
      }, 4200);
    }

    function beginOpeningTransition(mode = 'audience') {
      stopOpeningTransition();
      stopOfficeHandoffTransition();
      pauseBgm();
      openingTransitionMode = mode;
      launchScreen = mode === 'departure' ? 'commissioning' : 'transition';
      const kicker = document.getElementById('transitionKicker');
      const title = document.getElementById('transitionTitle');
      const copy = document.getElementById('transitionCopy');
      if (kicker) kicker.textContent = mode === 'departure' ? '密令已下｜南赴桂阳' : '襄阳夜召｜州府内堂';
      if (title) title.textContent = mode === 'departure' ? '赴桂阳' : '一纸密令';
      if (copy) copy.textContent = mode === 'departure'
        ? '朱印已落，晨雾未开。荆南门户，自此由你执掌。'
        : '墨色未散，州府的灯火已在夜雨中亮起。';
      render();
      const transition = document.getElementById('openingTransition');
      if (transition) {
        void transition.offsetWidth;
        transition.classList.add('playing');
      }
      openingTransitionTimer = setTimeout(completeOpeningTransition, mode === 'departure' ? 2600 : 3600);
    }

    function beginCommissioningTransition() {
      const name = characterDraft.name || randomChineseName();
      if (!isValidPlayerName(name)) {
        updateCharacterCreation();
        return toast('姓名须二至六字');
      }
      characterDraft.name = name;
      updateCharacterCreation();
      beginOpeningTransition('departure');
    }

    function beginIntro() {
      if (launchScreen !== 'intro') return;
      const intro = document.getElementById('intro');
      const video = document.getElementById('introVideo');
      intro.classList.add('show');
      if (!video) return showIntroPlayButton('视频未能加载，继续创建角色', true);
      video.currentTime = 0;
      hideIntroPlayButton();
      playIntroVideo();
    }

    function finishIntro() {
      stopIntroVideo();
      resumeBgm(); // 动画结束后恢复背景音乐
      gameState.storyFlags.introSeen = true;
      beginOpeningTransition('audience');
    }

    function bindEvents() {
      document.addEventListener('click', async event => {
        if (event.target.closest('[data-defeat-restart]')) {
          restartAfterDefeat();
          return;
        }
        const authModeButton = event.target.closest('[data-auth-mode]');
        if (authModeButton) {
          authMode = authModeButton.getAttribute('data-auth-mode') === 'register' ? 'register' : 'login';
          setAuthStatus(authMode === 'register' ? '填写账号和密钥后即可注册。' : '输入账号和密钥登录。');
          updateAuthScreen();
          return;
        }
        if (event.target.closest('[data-auth-guest]')) {
          await enterAsGuest();
          return;
        }
        const modeChoice = event.target.closest('[data-game-mode-choice]');
        if (modeChoice) {
          selectedNewGameMode = modeChoice.getAttribute('data-game-mode-choice') === 'story' ? 'story' : 'sandbox';
          updateMainMenu();
          return;
        }
        const menuAction = event.target.closest('[data-menu-action]');
        if (menuAction) {
          const action = menuAction.getAttribute('data-menu-action');
          if (action === 'continue' || action === 'load') await resumeSavedGame(true);
          if (action === 'new') beginNewGameFlow();
          if (action === 'back') returnToMainMenu();
          return;
        }
        const creationAdvance = event.target.closest('[data-creation-advance]');
        if (creationAdvance) {
          const targetStep = creationAdvance.getAttribute('data-creation-advance');
          if (targetStep === 'identity' && !characterDraft.name) characterDraft.name = randomChineseName();
          characterCreationStep = targetStep;
          updateCharacterCreation();
          if (targetStep === 'identity') startDefaultBgm();
          return;
        }
        const creationRetreat = event.target.closest('[data-creation-retreat]');
        if (creationRetreat) {
          characterCreationStep = creationRetreat.getAttribute('data-creation-retreat');
          updateCharacterCreation();
          return;
        }
        const identity = event.target.closest('[data-identity]');
        if (identity) {
          characterDraft.identity = identity.getAttribute('data-identity');
          updateCharacterCreation();
          startDefaultBgm();
          return;
        }
        if (event.target.closest('[data-random-name]')) {
          characterDraft.name = randomChineseName();
          updateCharacterCreation();
          return;
        }
        if (event.target.closest('[data-random-identity]')) {
          const ids = Object.keys(PLAYER_IDENTITIES);
          characterDraft.identity = ids[Math.floor(Math.random() * ids.length)];
          updateCharacterCreation();
          return;
        }
        if (event.target.closest('[data-start-game]')) {
          beginCommissioningTransition();
          return;
        }
        if (event.target.closest('[data-complete-transition]')) {
          if (openingTransitionMode === 'departure' && openingTransitionTimer) return;
          completeOpeningTransition();
          return;
        }
        const tutorial = event.target.closest('[data-tutorial-next]');
        if (tutorial) {
          gameState.storyFlags.tutorialStep = Number(tutorial.getAttribute('data-tutorial-next'));
          render();
          return;
        }
        const localTrial = event.target.closest('[data-local-trial]');
        if (localTrial) {
          resolveLocalTrial(localTrial.getAttribute('data-local-trial'));
          return;
        }
        if (event.target.closest('[data-close-modal]')) {
          closeActiveModal();
          return;
        }
        if (event.target.id === 'gameModalRoot' && gameState.activeModal?.type === 'portraitView') {
          closeActiveModal();
          return;
        }
        const openPortrait = event.target.closest('[data-open-character-portrait]');
        if (openPortrait) {
          gameState.activeModal = { type: 'portraitView', characterId: openPortrait.getAttribute('data-open-character-portrait') };
          renderModal();
          return;
        }
        const trainingChoice = event.target.closest('[data-training-choice]');
        if (trainingChoice) {
          chooseTrainingOrder(
            trainingChoice.getAttribute('data-training-city'),
            trainingChoice.getAttribute('data-training-choice')
          );
          return;
        }
        const tutorialGuideChoice = event.target.closest('[data-tutorial-guide-choice]');
        if (tutorialGuideChoice) {
          const guideId = tutorialGuideChoice.getAttribute('data-tutorial-guide-choice');
          const action = tutorialGuideChoice.getAttribute('data-guide-action');
          if (action === 'accept') {
            if (guideId === 'introStart') {
              // 关闭弹窗，聚焦桂阳，高亮地图桂阳区域
              markGuideSeen('introStart');
              setTrackedTask('inspectGuiyang');
              gameState.activeModal = null;
              gameState.selectedCityId = 'guiyang';
              gameState.activePanel = 'city';
              render();
              setTimeout(() => {
                setForceAction('clickCity', 'guiyang');
                highlightGuideSvgElement('#cityLayer [data-select-city="guiyang"]', '请点击桂阳城，查看人口、驻军与粮食概况', 'right');
              }, 200);
            } else {
              advanceTutorialAfterGuide(guideId);
            }
          }
          return;
        }
        const skipTutorial = event.target.closest('[data-skip-tutorial]');
        if (skipTutorial) {
          if (confirm('确定跳过全部新手引导？所有功能将直接解锁。')) {
            skipAllTutorial();
          }
          return;
        }
        if (event.target.closest('[data-start-force-guide]')) {
          gameState.activeModal = null;
          startForceGuide();
          return;
        }
        if (event.target.closest('[data-skip-force-guide]')) {
          if (confirm('确定跳过新手引导？所有功能将直接解锁。')) {
            skipForceGuide();
          }
          return;
        }
        const openTaskDrawer = event.target.closest('[data-open-task-drawer]');
        if (openTaskDrawer) {
          gameState.activeModal = { type: 'taskDrawer' };
          render();
          return;
        }
        const closeTaskDrawer = event.target.closest('[data-close-task-drawer]');
        if (closeTaskDrawer) {
          gameState.activeModal = null;
          render();
          return;
        }
        if (event.target.closest('[data-turn-summary-continue]')) {
          continueTurnSummary();
          return;
        }
        const openLetter = event.target.closest('[data-open-letter]');
        if (openLetter) {
          openLetterModal(openLetter.getAttribute('data-open-letter'));
          return;
        }
        const finishCinematic = event.target.closest('[data-finish-letter-cinematic]');
        if (finishCinematic) {
          finishLetterCinematic(finishCinematic.getAttribute('data-finish-letter-cinematic'));
          return;
        }
        const letterChoice = event.target.closest('[data-letter-choice]');
        if (letterChoice) {
          Promise.resolve(resolveLetterChoice(letterChoice.getAttribute('data-letter'), letterChoice.getAttribute('data-letter-choice')))
            .catch(error => {
              console.error('Letter choice failed:', error);
              toast('信件选项处理失败，请打开控制台查看错误。');
            });
          return;
        }
        const aiContentButton = event.target.closest('[data-ai-content-type]');
        if (aiContentButton) {
          const aiType = aiContentButton.getAttribute('data-ai-content-type');
          const aiPayloadId = aiContentButton.getAttribute('data-ai-content-payload-id');
          const letterId = aiContentButton.getAttribute('data-letter') || gameState.activeModal?.letterId || null;
          gameState.aiContentPayloads ||= {};
          let payload = gameState.aiContentPayloads[aiPayloadId] || {};
          if (aiType === 'letterBody' && letterId && !payload.letterId) {
            const letter = gameState.letters.find(item => item.id === letterId);
            if (letter) {
              payload = {
                id: 'letter_' + letter.id,
                letterId: letter.id,
                characterId: letter.fromCharacterId || letter.senderId || '',
                senderName: letter.senderName || '',
                title: letter.title || '',
                summary: letter.summary || letter.body || '',
                choices: (letter.choices || []).map(choice => choice.label),
                turn: gameState.turn
              };
              if (aiPayloadId) gameState.aiContentPayloads[aiPayloadId] = payload;
            }
          }
          openAiContentModal(aiType, payload, {
            letterId,
            returnModal: letterId ? { type: 'letter', letterId } : null
          });
          return;
        }
        const openTurnEvent = event.target.closest('[data-open-turn-event]');
        if (openTurnEvent) {
          openTurnEventModal(openTurnEvent.getAttribute('data-open-turn-event'));
          return;
        }
        const specialChoice = event.target.closest('[data-special-choice]');
        if (specialChoice) {
          resolveSpecialEventChoice(specialChoice.getAttribute('data-special'), specialChoice.getAttribute('data-special-choice'));
          return;
        }
        const urgentChoice = event.target.closest('[data-urgent-choice]');
        if (urgentChoice) {
          resolveUrgentMatter(urgentChoice.getAttribute('data-matter'), urgentChoice.getAttribute('data-urgent-choice'));
          return;
        }
        const characterFilter = event.target.closest('[data-character-filter]');
        if (characterFilter) {
          gameState.characterFilter = characterFilter.getAttribute('data-character-filter');
          gameState.characterProfileId = null;
          renderRightPanel();
          return;
        }
        const closeCharacterProfile = event.target.closest('[data-close-character-profile]');
        if (closeCharacterProfile) {
          gameState.characterProfileId = null;
          renderRightPanel();
          return;
        }
        const openCharacterProfile = event.target.closest('[data-open-character-profile]');
        if (openCharacterProfile) {
          const characterId = openCharacterProfile.getAttribute('data-open-character-profile');
          if (checkForceAction('clickCharacter', characterId)) return;
          gameState.selectedCharacterId = characterId;
          gameState.characterProfileId = characterId;
          renderRightPanel();
          if (isGuideActive() && isForceAction('clickCharacter', characterId)) {
            advanceGuideStep();
          }
          return;
        }
        const characterTarget = event.target.closest('[data-select-character]');
        if (characterTarget) {
          gameState.selectedCharacterId = characterTarget.getAttribute('data-select-character');
          renderRightPanel();
          return;
        }
        const investigateBtn = event.target.closest('[data-investigate-character]');
        if (investigateBtn) {
          investigateCharacter(investigateBtn.getAttribute('data-investigate-character'));
          return;
        }
        const solicitLordBtn = event.target.closest('[data-solicit-lord]');
        if (solicitLordBtn) {
          startLordSolicitation(solicitLordBtn.getAttribute('data-solicit-lord'));
          return;
        }
        const lordChoiceBtn = event.target.closest('[data-lord-solicitation-choice]');
        if (lordChoiceBtn) {
          resolveLordSolicitationChoice(
            gameState.activeModal?.characterId,
            lordChoiceBtn.getAttribute('data-lord-solicitation-choice')
          );
          return;
        }
        const conversation = event.target.closest('[data-conversation]');
        if (conversation) {
          const convType = conversation.getAttribute('data-conversation');
          if (checkForceAction('clickConversation', convType)) return;
          startNpcConversation(conversation.getAttribute('data-character'), convType);
          if (isGuideActive() && isForceAction('clickConversation', convType)) {
            clearGuideHighlights();
            // 第3回合：不立即推进步骤，等对话弹窗关闭后再高亮结束回合
            if (!(gameState.tutorial.guidePhase === 3 && getGuideStepIndex(3) === 4)) {
              advanceGuideStep();
            }
          }
          return;
        }
        if (calibrationState.enabled && event.target.closest('#mapStage')) {
          handleCalibrationMapClick(event);
          return;
        }
        // HUD item click for guide (clickHudItem forceAction)
        const hudHelpItem = event.target.closest('[data-help-key]');
        if (hudHelpItem && isGuideActive() && gameState.tutorial.forceAction?.type === 'clickHudItem') {
          const helpKey = hudHelpItem.getAttribute('data-help-key');
          if (checkForceAction('clickHudItem', helpKey)) return;
          if (isForceAction('clickHudItem', helpKey)) {
            // Show the help tooltip immediately
            const val = HELP_TEXT[helpKey];
            const text = typeof val === 'function' ? val() : (val || '');
            if (text) {
              showTooltipForTarget(text, hudHelpItem);
            }
            advanceGuideStep();
            return;
          }
        }
        const apTarget = event.target.closest('[data-ap]');
        if (apTarget && isGuideActive() && isForceAction('clickAp')) {
          clearGuideHighlights();
          removeGuideOverlay();
          gameState.tutorial.forceAction = null;
          advanceGuideStep();
          return;
        }
        const cityTarget = event.target.closest('[data-select-city]');
        if (cityTarget) {
          const id = cityTarget.getAttribute('data-select-city');
          if (checkForceAction('clickCity', id)) return;
          selectCity(id, 'city');
          if (isGuideActive() && isForceAction('clickCity', id)) {
            gameState.activePanel = 'city';
            advanceGuideStep();
          }
          return;
        }
        const top = event.target.closest('[data-top]');
        if (top) {
          const action = top.getAttribute('data-top');
          if (action === 'save') {
            const saved = await saveGameProgress(true);
            if (saved) {
              const btn = event.target.closest('button');
              if (btn) {
                const origText = btn.textContent;
                btn.textContent = '已保存';
                btn.style.borderColor = '#88d17c';
                setTimeout(() => {
                  btn.textContent = origText;
                  btn.style.borderColor = '';
                }, 1500);
              }
            }
          }
          if (action === 'load') {
            const loaded = await resumeSavedGame(true);
            if (loaded && isGuideActive()) processGuidePhase();
          }
          if (action === 'reset') resetGame();
          if (action === 'music') { toggleMusic(); return; }
          return;
        }
        const map = event.target.closest('[data-map]');
        if (map) {
          focusMap(map.getAttribute('data-map'));
          return;
        }
        const tab = event.target.closest('[data-tab]');
        if (tab) {
          const tabId = tab.getAttribute('data-tab');
          if (checkForceAction('clickTab', tabId)) return;
          tryOpenTab(tabId);
          if (isGuideActive() && isForceAction('clickTab', tabId)) {
            advanceGuideStep();
          }
          return;
        }
        const cityOrder = event.target.closest('[data-city-order]');
        if (cityOrder) {
          const orderType = cityOrder.getAttribute('data-city-order');
          if (orderType === 'train') {
            openTrainingChoice(cityOrder.getAttribute('data-city'));
            return;
          }
          if (checkForceAction('cityOrder', orderType)) return;
          queueCityOrder(cityOrder.getAttribute('data-city'), orderType);
          if (isGuideActive() && isForceAction('cityOrder', orderType)) {
            advanceGuideStep();
          }
          return;
        }
        const policy = event.target.closest('[data-policy]');
        if (policy) {
          queuePolicy(policy.getAttribute('data-city'), policy.getAttribute('data-policy'), policy.getAttribute('data-policy-value'));
          return;
        }
        const openBattle = event.target.closest('[data-open-battle]');
        if (openBattle) {
          openBattlePlanner(openBattle.getAttribute('data-open-battle'));
          return;
        }
        const startAttackPlan = event.target.closest('[data-start-attack-plan]');
        if (startAttackPlan) {
          const planner = gameState.militaryPlanner || {};
          if (planner.targetId) {
            const shouldAdvance = isGuideActive() && isForceAction('startAttackPlan');
            openBattlePlanner(planner.targetId, planner.sourceId, planner.route);
            if (shouldAdvance) {
              gameState.tutorial.forceAction = null;
              clearGuideHighlights();
              removeGuideOverlay();
              setTimeout(() => advanceGuideStep(), 60);
            }
          }
          return;
        }
        const militaryOrder = event.target.closest('[data-military-order]');
        if (militaryOrder) {
          const orderType = militaryOrder.getAttribute('data-military-order');
          if (checkForceAction('militaryOrder', orderType)) return;
          queueMilitaryOrder(militaryOrder.getAttribute('data-military-city'), orderType);
          if (isGuideActive() && isForceAction('militaryOrder', orderType)) {
            advanceGuideStep();
          }
          return;
        }
        const setSourceCity = event.target.closest('[data-set-source-city]');
        if (setSourceCity) {
          const cityId = setSourceCity.getAttribute('data-set-source-city');
          gameState.militaryPlanner = gameState.militaryPlanner || {};
          gameState.militaryPlanner.sourceId = cityId;
          normalizeMilitaryPlannerSelection();
          renderRightPanel();
          return;
        }
        if (event.target.closest('[data-queue-battle]')) {
          queueBattle();
          if (isGuideActive() && isForceAction('queueBattle')) {
            gameState.tutorial.forceAction = null;
            clearGuideHighlights();
            removeGuideOverlay();
            setTimeout(() => advanceGuideStep(), 60);
          }
          return;
        }
        if (event.target.closest('[data-cancel-draft]')) {
          gameState.draftBattle = null;
          render();
          return;
        }
        const queueTransferButton = event.target.closest('[data-queue-transfer]');
        if (queueTransferButton) {
          queueTransfer(queueTransferButton.getAttribute('data-queue-transfer'));
          return;
        }
        const scheme = event.target.closest('[data-scheme-action]');
        if (scheme) {
          const actionType = scheme.getAttribute('data-scheme-action');
          if (checkForceAction('clickScheme', actionType)) return;
          queueScheme(actionType, scheme.getAttribute('data-target'), {
            characterId: scheme.getAttribute('data-scheme-character'),
            scheme: scheme.getAttribute('data-special-scheme')
          });
          if (isGuideActive() && isForceAction('clickScheme', actionType)) {
            advanceGuideStep();
          }
          return;
        }
        const dip = event.target.closest('[data-diplomacy-action]');
        if (dip) {
          const actionType = dip.getAttribute('data-diplomacy-action');
          if (checkForceAction('clickDiplomacy', actionType)) return;
          queueDiplomacy(actionType, dip.getAttribute('data-target'));
          if (isGuideActive() && isForceAction('clickDiplomacy', actionType)) {
            advanceGuideStep();
          }
          return;
        }
        const inner = event.target.closest('[data-inner-action]');
        if (inner) {
          const actionType = inner.getAttribute('data-inner-action');
          if (checkForceAction('clickInner', actionType)) return;
          queueInner(actionType);
          if (isGuideActive() && isForceAction('clickInner', actionType)) {
            advanceGuideStep();
          }
          return;
        }
        const appointmentCity = event.target.closest('[data-select-appointment-city]');
        if (appointmentCity) {
          const cityId = appointmentCity.getAttribute('data-select-appointment-city');
          if (gameState.cities?.[cityId] && isControlledBy(cityId, 'player')) {
            gameState.appointmentQuickCityId = cityId;
            gameState.selectedCityId = cityId;
            render();
          }
          return;
        }
        const openPickerBtn = event.target.closest('[data-open-appointment-picker]');
        if (openPickerBtn) {
          openAppointmentPicker({
            cityId: openPickerBtn.getAttribute('data-appointment-city'),
            role: openPickerBtn.getAttribute('data-open-appointment-picker')
          });
          return;
        }
        const openCommanderPickerBtn = event.target.closest('[data-open-campaign-commander-manager]');
        if (openCommanderPickerBtn) {
          openAppointmentPicker({
            campaignId: openCommanderPickerBtn.getAttribute('data-open-campaign-commander-manager'),
            role: 'campaignCommander'
          });
          return;
        }
        const pickerCityBtn = event.target.closest('[data-appoint-city-from-picker]');
        if (pickerCityBtn) {
          const cityId = pickerCityBtn.getAttribute('data-appoint-city-from-picker');
          const role = pickerCityBtn.getAttribute('data-appointment-role');
          const characterId = pickerCityBtn.getAttribute('data-character-id');
          appointCityOfficial(cityId, role, characterId);
          gameState.activeModal = null;
          render();
          toast('任命完成');
          return;
        }
        const pickerCommanderBtn = event.target.closest('[data-appoint-campaign-commander-from-picker]');
        if (pickerCommanderBtn) {
          const campaignId = pickerCommanderBtn.getAttribute('data-appoint-campaign-commander-from-picker');
          const characterId = pickerCommanderBtn.getAttribute('data-character-id');
          appointCampaignCommander(campaignId, characterId);
          gameState.activeModal = null;
          render();
          toast('主将任命完成');
          return;
        }
        const removeCityOfficialBtn = event.target.closest('[data-remove-city-official]');
        if (removeCityOfficialBtn) {
          const cityId = removeCityOfficialBtn.getAttribute('data-remove-city-official-city');
          const slot = removeCityOfficialBtn.getAttribute('data-remove-city-official-slot');
          const characterId = removeCityOfficialBtn.getAttribute('data-remove-city-official-character');
          removeCityOfficial(cityId, slot, characterId);
          toast('已撤任');
          return;
        }
        const removeCommanderBtn = event.target.closest('[data-remove-campaign-commander]');
        if (removeCommanderBtn) {
          removeCampaignCommander(removeCommanderBtn.getAttribute('data-remove-campaign-commander'));
          toast('主将已撤任');
          return;
        }
        const yuan = event.target.closest('[data-yuan-action]');
        if (yuan) {
          performYuanAction(yuan.getAttribute('data-yuan-action'));
          return;
        }
        const liubiao = event.target.closest('[data-liubiao-action]');
        if (liubiao) {
          const action = liubiao.getAttribute('data-liubiao-action');
          queueLiuBiaoAction(action);
          if (isGuideActive() && isForceAction('liubiaoAction', action)) {
            gameState.tutorial.forceAction = null;
            clearGuideHighlights();
            removeGuideOverlay();
            advanceGuideStep();
          }
          return;
        }
        if (event.target.closest('[data-liubiao-declare-independent]')) {
          declareIndependenceFromLiuBiao();
          return;
        }
        const defense = event.target.closest('[data-defense-choice]');
        if (defense) {
          resolveDefense(defense.getAttribute('data-defense-choice'));
          return;
        }
        if (event.target.closest('[data-end-turn]')) {
          if (checkForceAction('endTurn', 'endTurn')) return;
          endTurn();
          if (isGuideActive() && isForceAction('endTurn', 'endTurn')) {
            // endGuideTurn is called inside endTurn, which advances phase
          }
          return;
        }
        if (event.target.closest('[data-undo-order]')) {
          undoOrder();
          return;
        }
        if (event.target.closest('[data-clear-orders]')) {
          clearOrders();
          return;
        }
        const introPlay = event.target.closest('[data-play-intro]');
        if (introPlay) {
          if (introPlay.dataset.introFallback === '1') finishIntro();
          else playIntroVideo();
          return;
        }
        if (event.target.closest('[data-skip-intro]')) {
          finishIntro();
          return;
        }
        const mapClick = event.target.closest('#mapStage');
        if (mapClick) {
          // During force guide, only allow clicking the targeted city
          if (isGuideActive() && gameState.tutorial.forceAction?.type === 'clickCity') {
            const point = svgPointToWorld(clientToSvgPoint(event.clientX, event.clientY));
            const region = regionAtPoint(point);
            const cityId = region?.id;
            if (cityId) {
              if (checkForceAction('clickCity', cityId)) return;
              selectCity(cityId, 'city');
              if (isForceAction('clickCity', cityId)) {
                gameState.activePanel = 'city';
                advanceGuideStep();
              }
            }
            return;
          }
          selectNearestCityFromMapEvent(event);
        }
      });

      document.addEventListener('submit', event => {
        if (event.target.id === 'authForm') {
          event.preventDefault();
          submitAuthForm();
        }
      });

      const introVideo = document.getElementById('introVideo');
      if (introVideo) {
        introVideo.addEventListener('play', hideIntroPlayButton);
        introVideo.addEventListener('ended', finishIntro);
        introVideo.addEventListener('error', () => {
          showIntroPlayButton('视频未能加载，继续创建角色', true);
        });
      }

      document.addEventListener('ended', event => {
        const video = event.target instanceof Element ? event.target.closest('[data-letter-cinematic-video]') : null;
        if (!video) return;
        finishLetterCinematic(video.getAttribute('data-letter-cinematic-video'));
      }, true);

      document.addEventListener('keydown', event => {
        handleGameKeyboardShortcut(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape' && gameState.activeModal?.type === 'portraitView') {
          event.preventDefault();
          closeActiveModal();
          return;
        }
        if (event.altKey && event.key.toLowerCase() === 'm') {
          event.preventDefault();
          toggleCalibrationMode();
          return;
        }
        if (!calibrationState.enabled) return;
        if (event.key.toLowerCase() === 'e') {
          event.preventDefault();
          exportMapDataJson();
          return;
        }
        if (event.key.toLowerCase() === 'c') {
          event.preventDefault();
          const region = getRegion(calibrationState.selectedRegionId);
          if (region) {
            region.polygon = [];
            toast(region.name + ' polygon 已清空');
            renderMap();
          }
        }
      });

      document.addEventListener('input', event => {
        if (event.target.id === 'playerNameInput') {
          if (event.isComposing || isComposingPlayerName) return;
          characterDraft.name = sanitizeChineseName(event.target.value);
          event.target.value = characterDraft.name;
          updateCharacterCreation();
          return;
        }
        const policySlider = event.target.closest('[data-policy-slider]');
        if (policySlider) {
          updatePolicySlider(
            policySlider.getAttribute('data-city'),
            policySlider.getAttribute('data-policy-slider'),
            policySlider.value
          );
          return;
        }
        const draftInput = event.target.closest('[data-draft-input]');
        if (draftInput && gameState.draftBattle) {
          const rawVal = draftInput.value.replace(/[^0-9]/g, '');
          draftInput.value = rawVal;
          gameState.draftBattle[draftInput.getAttribute('data-draft-input')] = Number(rawVal) || 100;
          return;
        }
        const transferInput = event.target.closest('[data-transfer-input]');
        if (transferInput && gameState.draftTransfer) {
          const rawVal = transferInput.value.replace(/[^0-9]/g, '');
          transferInput.value = rawVal;
          gameState.draftTransfer[transferInput.getAttribute('data-transfer-input')] = Number(rawVal) || 100;
          return;
        }
      });

      document.addEventListener('compositionstart', event => {
        if (event.target.id === 'playerNameInput') {
          isComposingPlayerName = true;
        }
      });

      document.addEventListener('compositionend', event => {
        if (event.target.id === 'playerNameInput') {
          isComposingPlayerName = false;
          characterDraft.name = sanitizeChineseName(event.target.value);
          event.target.value = characterDraft.name;
          updateCharacterCreation();
        }
      });

      document.addEventListener('change', event => {
        const draftField = event.target.closest('[data-draft-field]');
        if (draftField && gameState.draftBattle) {
          gameState.draftBattle[draftField.getAttribute('data-draft-field')] = draftField.value;
          renderMap();
          renderRightPanel();
          return;
        }
        // 参战兵力输入：校验并钳制到可调兵力范围
        const draftInputC = event.target.closest('[data-draft-input]');
        if (draftInputC && gameState.draftBattle) {
          const source = gameState.cities[gameState.draftBattle.source];
          const maxTroops = Math.max(100, realTroops(source.garrison) - 300 - pendingTroopsFrom(source.id));
          let val = Number(draftInputC.value.replace(/[^0-9]/g, '')) || 100;
          if (val < 100) val = 100;
          if (val > maxTroops) val = maxTroops;
          gameState.draftBattle.troops = val;
          renderMap();
          renderRightPanel();
          return;
        }
        const transferField = event.target.closest('[data-transfer-field]');
        if (transferField && gameState.draftTransfer) {
          gameState.draftTransfer[transferField.getAttribute('data-transfer-field')] = transferField.value;
          renderRightPanel();
        }
        // 调兵兵力输入：校验并钳制
        const transferInputC = event.target.closest('[data-transfer-input]');
        if (transferInputC && gameState.draftTransfer) {
          const srcCity = gameState.cities[gameState.draftTransfer.source] || controlledCities()[0];
          if (srcCity) {
            const maxTroops = Math.max(100, realTroops(srcCity.garrison) - 300 - pendingTroopsFrom(srcCity.id));
            let val = Number(transferInputC.value.replace(/[^0-9]/g, '')) || 100;
            if (val < 100) val = 100;
            if (val > maxTroops) val = maxTroops;
            gameState.draftTransfer.troops = val;
            renderRightPanel();
            return;
          }
        }
        const plannerField = event.target.closest('[data-military-planner-field]');
        if (plannerField) {
          gameState.militaryPlanner = gameState.militaryPlanner || {};
          const fieldName = plannerField.getAttribute('data-military-planner-field');
          gameState.militaryPlanner[fieldName] = plannerField.value;
          // 如果 source 改变后 target 不可达，自动选择第一个可达目标
          if (fieldName === 'sourceId' || fieldName === 'route') {
            normalizeMilitaryPlannerSelection();
          }
          renderRightPanel();
        }
        const autoTaskField = event.target.closest('[data-auto-task-field]');
        if (autoTaskField) {
          const field = autoTaskField.getAttribute('data-auto-task-field');
          const value = autoTaskField.type === 'checkbox' ? autoTaskField.checked : autoTaskField.value;
          setCityAutoTask(autoTaskField.getAttribute('data-auto-task-city'), field, value);
          return;
        }
        const autoModeToggle = event.target.closest('[data-toggle-auto-mode]');
        if (autoModeToggle) {
          toggleCityAutoTaskMode(
            autoModeToggle.getAttribute('data-auto-task-city'),
            autoModeToggle.getAttribute('data-toggle-auto-mode'),
            autoModeToggle.getAttribute('data-auto-mode')
          );
        }
      });

      const svg = document.getElementById('mapStage');
      svg.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const centerTarget = event.target.closest('[data-calibration-center]');
        if (calibrationState.enabled && centerTarget) {
          svg.setPointerCapture(event.pointerId);
          calibrationState.draggingCenter = centerTarget.getAttribute('data-calibration-center');
          svg.classList.add('dragging');
          return;
        }
        svg.setPointerCapture(event.pointerId);
        dragState = { point: clientToSvgPoint(event.clientX, event.clientY), moved: false };
        svg.classList.add('dragging');
      });
      svg.addEventListener('pointermove', event => {
        if (calibrationState.draggingCenter) {
          const region = getRegion(calibrationState.draggingCenter);
          const city = gameState.cities[calibrationState.draggingCenter];
          const point = svgPointToWorld(clientToSvgPoint(event.clientX, event.clientY));
          if (region && city) {
            region.center.x = Math.round(point.x);
            region.center.y = Math.round(point.y);
            city.x = region.center.x;
            city.y = region.center.y;
            calibrationState.lastPoint = point;
            renderMap();
          }
          return;
        }
        if (!dragState) return;
        const point = clientToSvgPoint(event.clientX, event.clientY);
        const dx = point.x - dragState.point.x;
        const dy = point.y - dragState.point.y;
        if (Math.abs(dx) + Math.abs(dy) > 1.5) dragState.moved = true;
        gameState.mapState.panX += dx;
        gameState.mapState.panY += dy;
        normalizeMapView();
        dragState.point = point;
        renderMap();
      });
      svg.addEventListener('pointerup', () => {
        if (calibrationState.draggingCenter) {
          calibrationState.draggingCenter = null;
          suppressNextMapClick = true;
          svg.classList.remove('dragging');
          setTimeout(() => {
            suppressNextMapClick = false;
          }, 0);
          render();
          return;
        }
        suppressNextMapClick = !!(dragState && dragState.moved);
        dragState = null;
        svg.classList.remove('dragging');
        setTimeout(() => {
          suppressNextMapClick = false;
        }, 0);
      });
      svg.addEventListener('wheel', event => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? -1 : 1;
        zoomMapAt(event.clientX, event.clientY, direction * 0.18);
        renderMap();
      }, { passive: false });

      window.addEventListener('resize', () => {
        normalizeMapView();
        renderMap();
      });
    }

    function initGame() {
    characterDraft = {
      name: gameState.player?.name || '',
      identity: gameState.player?.identity || 'commandant'
    };
    FACTIONS.player.name = gameState.player?.name || '玩家';
    mapData = createMapData();
    syncMapDataFromGameState();

    applyEmbeddedMapImage();
    bindEvents();
    document.addEventListener('pointerdown', enforceBgmAnimationLock, true);
    document.addEventListener('click', enforceBgmAnimationLock, true);
    document.addEventListener('keydown', enforceBgmAnimationLock, true);
    // 长悬停 tooltip 事件
    document.addEventListener('mouseover', event => { handleHelpHover(event); });
    document.addEventListener('mouseleave', event => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-help], [data-help-key]')) hideTooltip();
    }, true);
    document.addEventListener('click', () => { hideTooltip(); });
    document.addEventListener('scroll', () => { hideTooltip(); }, true);
    if (loadedGameState) normalizeActionPointsAfterLoad();
    else resetActionPoints();
    render();
    validateCityData();
    // Restore guide highlights only when actually entering the game screen
    if (isGuideActive() && launchScreen === 'game') {
      processGuidePhase();
    }
    if (gameState.turn > 1) {
      toast('已自动读取存档，欢迎回来。当前第' + gameState.turn + '回合');
    }
    if (gameState.storyFlags.introSeen) {
      startAutosaveTimer();
      updateAutosaveDisplay();
    }
    }

    initGame();

    function validateStorageSystem() {
      const raw = localStorage.getItem(SAVE_KEY);
      const backupRaw = localStorage.getItem(SAVE_KEY_BACKUP);
      let parsed = null;

      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (error) {
        parsed = { parseError: String(error) };
      }

      const result = {
        saveKey: SAVE_KEY,
        hasRawSave: !!raw,
        rawLength: raw ? raw.length : 0,
        hasBackupSave: !!backupRaw,
        backupRawLength: backupRaw ? backupRaw.length : 0,
        savedAt: localStorage.getItem(SAVE_KEY + ':lastSavedAt'),
        currentTurn: gameState?.turn,
        currentPlayer: gameState?.player?.name,
        currentCharacterCreated: !!gameState?.storyFlags?.characterCreated,
        currentIntroSeen: !!gameState?.storyFlags?.introSeen,
        savedTurn: parsed?.turn,
        savedPlayer: parsed?.player?.name,
        savedCharacterCreated: !!parsed?.storyFlags?.characterCreated,
        savedIntroSeen: !!parsed?.storyFlags?.introSeen,
        canParse: !!parsed && !parsed.parseError,
        parseError: parsed?.parseError || null,
        loadDiagnostics: storageLoadDiagnostics.map(item => JSON.stringify(item)).join(' | ')
      };

      console.table(result);
      return result;
    }

    window.validateStorageSystem = validateStorageSystem;

    function validateAiContentSystem() {
      return {
        turn: gameState.turn,
        aiUsage: gameState.aiUsage,
        cacheCount: Object.keys(gameState.aiContentCache || {}).length,
        payloadCount: Object.keys(gameState.aiContentPayloads || {}).length,
        cache: Object.entries(gameState.aiContentCache || {}).map(([key, item]) => ({
          key,
          type: item.type,
          turn: item.turn,
          title: item.title,
          hasText: !!item.text,
          source: item.source || 'unknown',
          createdAt: item.createdAt
        }))
      };
    }

    window.validateAiContentSystem = validateAiContentSystem;

    function validateRemovedCitiesCleanup() {
      const removed = [...REMOVED_CITY_IDS];
      const state = gameState;
      if (!state) return { error: 'gameState 未初始化' };

      const result = {
        removed,
        citiesStillExist: removed.filter(id => !!state.cities?.[id]),
        regionsStillExist: removed.filter(id => !!state.mapData?.regions?.[id]),
        selectedIsRemoved: isRemovedCityId(state.selectedCityId),
        cityRefs: [],
        regionRefs: [],
        routeRefs: [],
        waterRouteRefs: [],
        orderRefs: [],
        militaryOrderRefs: [],
        campaignRefs: [],
        urgentRefs: [],
        draftRefs: [],
        plannerRefs: [],
        uiTextRefs: []
      };

      // 检查 cities 中的引用
      Object.values(state.cities || {}).forEach(city => {
        ['neighbors', 'roads', 'waters'].forEach(key => {
          (city[key] || []).forEach(id => {
            if (isRemovedCityId(id)) {
              result.cityRefs.push(city.id + '.' + key + ' -> ' + id);
            }
          });
        });
      });

      // 检查 regions 中的引用
      Object.values(state.mapData?.regions || {}).forEach(region => {
        ['neighbors', 'roads', 'waters'].forEach(key => {
          (region[key] || []).forEach(id => {
            if (isRemovedCityId(id)) {
              result.regionRefs.push(region.id + '.' + key + ' -> ' + id);
            }
          });
        });
      });

      // 检查 ROUTES
      (ROUTES || []).forEach(route => {
        if ((route || []).some(isRemovedCityId)) {
          result.routeRefs.push(route.join(' -> '));
        }
      });

      // 检查 WATER_ROUTES
      (WATER_ROUTES || []).forEach(route => {
        if ((route || []).some(isRemovedCityId)) {
          result.waterRouteRefs.push(route.join(' -> '));
        }
      });

      // 检查 orders
      (state.orders || []).forEach(order => {
        const text = JSON.stringify(order);
        removed.forEach(id => {
          if (text.includes('"' + id + '"')) result.orderRefs.push(order.id || text.slice(0, 120));
        });
      });

      // 检查 militaryOrders
      (state.militaryOrders || []).forEach(order => {
        const text = JSON.stringify(order);
        removed.forEach(id => {
          if (text.includes('"' + id + '"')) result.militaryOrderRefs.push(order.id || text.slice(0, 120));
        });
      });

      // 检查 campaigns
      (state.campaigns || []).forEach(campaign => {
        const text = JSON.stringify(campaign);
        removed.forEach(id => {
          if (text.includes('"' + id + '"')) result.campaignRefs.push(campaign.id || text.slice(0, 120));
        });
      });

      // 检查 urgentMatters
      (state.urgentMatters || []).forEach(item => {
        const text = JSON.stringify(item);
        removed.forEach(id => {
          if (text.includes('"' + id + '"')) result.urgentRefs.push(item.id || text.slice(0, 120));
        });
      });

      // 检查 draftTransfer / draftBattle
      if (state.draftTransfer) {
        removed.forEach(id => {
          if (JSON.stringify(state.draftTransfer).includes('"' + id + '"'))
            result.draftRefs.push('draftTransfer: ' + JSON.stringify(state.draftTransfer).slice(0, 120));
        });
      }
      if (state.draftBattle) {
        removed.forEach(id => {
          if (JSON.stringify(state.draftBattle).includes('"' + id + '"'))
            result.draftRefs.push('draftBattle: ' + JSON.stringify(state.draftBattle).slice(0, 120));
        });
      }

      // 检查 militaryPlanner
      if (state.militaryPlanner) {
        removed.forEach(id => {
          if (JSON.stringify(state.militaryPlanner).includes('"' + id + '"'))
            result.plannerRefs.push('militaryPlanner: ' + JSON.stringify(state.militaryPlanner).slice(0, 120));
        });
      }

      const allPassed =
        result.citiesStillExist.length === 0 &&
        result.regionsStillExist.length === 0 &&
        result.cityRefs.length === 0 &&
        result.regionRefs.length === 0 &&
        result.routeRefs.length === 0 &&
        result.waterRouteRefs.length === 0 &&
        result.orderRefs.length === 0 &&
        result.militaryOrderRefs.length === 0 &&
        result.campaignRefs.length === 0 &&
        result.urgentRefs.length === 0 &&
        result.draftRefs.length === 0 &&
        result.plannerRefs.length === 0 &&
        !result.selectedIsRemoved;

      result.allPassed = allPassed;
      console.table(result);
      if (allPassed) {
        console.log('✅ 零陵清理验证通过：所有 removed city 引用已清除');
      } else {
        console.warn('⚠️ 零陵清理验证未通过，请检查上表');
      }
      return result;
    }

    window.validateRemovedCitiesCleanup = validateRemovedCitiesCleanup;

    function validateGuiyangYuzhangLink() {
      const result = {
        guiyangCityNeighbors: cleanIdArray(gameState.cities.guiyang?.neighbors),
        guiyangCityRoads: cleanIdArray(gameState.cities.guiyang?.roads),
        yuzhangCityNeighbors: cleanIdArray(gameState.cities.yuzhang?.neighbors),
        yuzhangCityRoads: cleanIdArray(gameState.cities.yuzhang?.roads),
        guiyangUnifiedNeighbors: cityNeighborIds('guiyang'),
        yuzhangUnifiedNeighbors: cityNeighborIds('yuzhang'),
        routeExists: (ROUTES || []).some(([a, b]) =>
          (a === 'guiyang' && b === 'yuzhang') || (a === 'yuzhang' && b === 'guiyang')
        ),
        reachDistanceToYuzhang: cityReachDistance('yuzhang'),
        canOperateYuzhang: canOperateAtCity('yuzhang'),
        canAttackYuzhang: canAttackCity('yuzhang'),
        campaignSource: getCampaignSource('yuzhang'),
        campaignRoute: findCampaignRoute('guiyang', 'yuzhang', 'official')
      };
      console.table(result);
      return result;
    }

    window.validateGuiyangYuzhangLink = validateGuiyangYuzhangLink;
