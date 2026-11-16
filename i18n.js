// Release v1.0.0：言語設定（日本語・English・한국어・中文・Español）
// 画面の文字（メニュー・ボタン・地名・人格名など）を、選んだ言語に置きかえて表示します。
(function (PS) {
  'use strict';
  const LANGS = [['ja', '日本語'], ['en', 'English'], ['ko', '한국어'], ['zh', '中文'], ['es', 'Español']];
  const IDX = { ja: 0, en: 1, ko: 2, zh: 3, es: 4 };
  // [日本語, English, 한국어, 中文, Español]
  const T = [
    // ---- タイトル・ロード ----
    ['クリックしてスタート', 'Click to Start', '클릭하여 시작', '点击开始', 'Haz clic para empezar'],
    ['タップしてスタート', 'Tap to Start', '탭하여 시작', '轻触开始', 'Toca para empezar'],
    ['つづきから', 'Continue', '이어하기', '继续游戏', 'Continuar'],
    ['はじめから', 'New Game', '처음부터', '重新开始', 'Nueva partida'],
    ['正式リリース版', 'Official Release', '정식 출시판', '正式发行版', 'Versión oficial'],
    ['― 転生者と七つの人格 ―', '— The Reborn and the Seven Personalities —', '― 전생자와 일곱 인격 ―', '― 转生者与七种人格 ―', '— El renacido y las siete personalidades —'],
    ['スマホやタブレットでプレイしている場合について', 'Playing on a smartphone or tablet', '스마트폰·태블릿으로 플레이하는 경우', '关于使用手机或平板游玩', 'Si juegas en móvil o tableta'],
    ['本作品はフィクションです。実在の人物・団体・事件とは関係ありません。', 'This is a work of fiction. Any resemblance to real persons, groups or events is coincidental.', '본 작품은 픽션입니다. 실존 인물·단체·사건과는 관계가 없습니다.', '本作品纯属虚构，与真实人物、团体、事件无关。', 'Esta obra es ficción. No tiene relación con personas, grupos ni hechos reales.'],
    ['ライセンス表示', 'License', '라이선스', '许可协议', 'Licencia'],
    ['ライセンス', 'License', '라이선스', '许可协议', 'Licencia'],
    ['データ削除', 'Delete Data', '데이터 삭제', '删除数据', 'Borrar datos'],
    ['世界を構築しています', 'Building the world', '세계를 구축하고 있습니다', '正在构建世界', 'Construyendo el mundo'],
    ['準備が整いました', 'Ready', '준비 완료', '准备就绪', 'Listo'],
    ['利用規約に同意してください', 'Please accept the Terms of Use', '이용 약관에 동의해 주세요', '请同意使用条款', 'Acepta los Términos de uso'],
    ['ライセンスおよび利用規約に同意します（', 'I agree to the License and Terms of Use (', '라이선스 및 이용 약관에 동의합니다 (', '我同意许可协议及使用条款（', 'Acepto la Licencia y los Términos de uso ('],
    ['外洋を凍らせています', 'Freezing the open sea', '바다를 얼리고 있습니다', '正在冰封外海', 'Congelando el mar abierto'],
    ['森を育てています', 'Growing the forests', '숲을 키우고 있습니다', '正在培育森林', 'Haciendo crecer los bosques'],
    ['村を建てています', 'Building the villages', '마을을 짓고 있습니다', '正在建造村庄', 'Construyendo las aldeas'],
    ['大地を彩っています', 'Painting the land', '대지를 물들이고 있습니다', '正在为大地上色', 'Pintando la tierra'],
    ['光と影を計算しています', 'Calculating light and shadow', '빛과 그림자를 계산하고 있습니다', '正在计算光影', 'Calculando luces y sombras'],
    ['世界地図を描いています', 'Drawing the world map', '세계 지도를 그리고 있습니다', '正在绘制世界地图', 'Dibujando el mapa del mundo'],
    ['大地をGPUに送っています', 'Sending the land to the GPU', '대지를 GPU로 보내고 있습니다', '正在将大地传送至GPU', 'Enviando la tierra a la GPU'],
    ['氷河に命を吹き込んでいます', 'Breathing life into the glaciers', '빙하에 생명을 불어넣고 있습니다', '正在为冰川注入生命', 'Dando vida a los glaciares'],
    ['クリックでスキップ', 'Click to skip', '클릭하여 건너뛰기', '点击跳过', 'Haz clic para saltar'],
    // ---- メニュー ----
    ['メニュー', 'Menu', '메뉴', '菜单', 'Menú'], ['ステータス', 'Status', '스테이터스', '状态', 'Estado'], ['仲間', 'Party', '동료', '伙伴', 'Compañeros'],
    ['バッグ', 'Bag', '가방', '背包', 'Bolsa'], ['クエスト', 'Quests', '퀘스트', '任务', 'Misiones'], ['地図', 'Map', '지도', '地图', 'Mapa'],
    ['お知らせ', 'News', '공지사항', '公告', 'Noticias'], ['設定', 'Settings', '설정', '设置', 'Ajustes'], ['セーブ', 'Save', '저장', '保存', 'Guardar'],
    ['操作説明', 'Controls', '조작 설명', '操作说明', 'Controles'], ['タイトルへ戻る', 'Back to Title', '타이틀로 돌아가기', '返回标题', 'Volver al título'],
    ['ミラクルガチャ', 'Miracle Gacha', '미라클 가챠', '奇迹扭蛋', 'Gacha Milagro'], ['プラスパス', 'Plus Pass', '플러스 패스', '加号通行证', 'Pase Plus'],
    ['衣装', 'Outfits', '의상', '服装', 'Atuendos'], ['ログインボーナス', 'Login Bonus', '로그인 보너스', '登录奖励', 'Bono diario'],
    ['ログインボーナスプラス', 'Login Bonus PLUS', '로그인 보너스 플러스', '登录奖励PLUS', 'Bono diario PLUS'],
    ['スターコイン', 'Star Coins', '스타 코인', '星币', 'Monedas estelares'], ['星の欠片', 'Star Shards', '별의 조각', '星之碎片', 'Fragmentos estelares'],
    ['旅の仲間', 'Companions', '여행 동료', '旅伴', 'Compañeros de viaje'], ['討伐数', 'Defeated', '토벌 수', '讨伐数', 'Derrotados'], ['プレイ時間', 'Play Time', '플레이 시간', '游戏时间', 'Tiempo de juego'],
    ['ヨミガエクリスタル', 'Revival Crystal', '부활의 크리스탈', '复苏水晶', 'Cristal de Resurrección'], ['氷晶', 'Ice Crystals', '빙정', '冰晶', 'Cristales de hielo'], ['夜島', 'Night Island', '밤의 섬', '夜岛', 'Isla Nocturna'],
    ['サポートキャラ', 'Support', '서포트 캐릭터', '辅助角色', 'Apoyo'], ['閉じる', 'Close', '닫기', '关闭', 'Cerrar'], ['キャンセル', 'Cancel', '취소', '取消', 'Cancelar'], ['確認', 'OK', '확인', '确认', 'Aceptar'],
    ['セーブしました', 'Game saved', '저장했습니다', '已保存', 'Partida guardada'], ['セーブに失敗しました', 'Failed to save', '저장에 실패했습니다', '保存失败', 'Error al guardar'],
    ['同行中', 'With you', '동행 중', '同行中', 'Contigo'], ['未加入', 'Not joined', '미가입', '未加入', 'No unido'], ['操作中', 'Active', '조작 중', '操作中', 'Activo'],
    ['得意', 'Strengths', '장점', '擅长', 'Puntos fuertes'], ['苦手', 'Weaknesses', '약점', '不擅长', 'Puntos débiles'], ['スキル', 'Skills', '스킬', '技能', 'Habilidades'],
    ['キー割り当て', 'Key', '키 할당', '按键分配', 'Tecla'], ['なし', 'None', '없음', '无', 'Ninguna'],
    ['天星石（星界の遺跡）', 'Sky Stones (Astral Ruins)', '천성석 (성계의 유적)', '天星石（星界遗迹）', 'Piedras celestes (Ruinas astrales)'], ['異界の結晶', 'Otherworld Crystals', '이계의 결정', '异界结晶', 'Cristales del otro mundo'], ['天界の欠片', 'Heaven Shards', '천계의 조각', '天界碎片', 'Fragmentos celestiales'],
    ['第一章　星の欠片', 'Chapter 1: Star Shards', '제1장　별의 조각', '第一章　星之碎片', 'Capítulo 1: Fragmentos estelares'], ['第二章　浮上せし大地', 'Chapter 2: The Risen Lands', '제2장　떠오른 대지', '第二章　浮起的大地', 'Capítulo 2: Las tierras alzadas'],
    ['第三章　異界の結晶', 'Chapter 3: Otherworld Crystals', '제3장　이계의 결정', '第三章　异界结晶', 'Capítulo 3: Cristales del otro mundo'], ['第四章　天界の欠片', 'Chapter 4: Heaven Shards', '제4장　천계의 조각', '第四章　天界碎片', 'Capítulo 4: Fragmentos celestiales'],
    ['第五章　氷の住む街とタイプドラゴン', 'Chapter 5: The City of Ice and the Type Dragon', '제5장　얼음이 사는 도시와 타입 드래곤', '第五章　冰之城与属性巨龙', 'Capítulo 5: La Ciudad de Hielo y el Dragón Tipo'],
    ['第五章クリア　平和になりかけた島', 'Chapter 5 cleared: An island near peace', '제5장 클리어　평화가 다가온 섬', '第五章通关　即将迎来和平的岛屿', 'Capítulo 5 superado: una isla casi en paz'], ['夜島　月影の章', 'Night Island: Moonshadow', '밤의 섬　달그림자의 장', '夜岛　月影之章', 'Isla Nocturna: Sombra lunar'],
    ['プラスパス', 'Plus Pass', '플러스 패스', '加号通行证', 'Pase Plus'], ['ステラの声', 'Stella\'s voice', '스텔라의 목소리', '斯特拉的声音', 'La voz de Stella'], ['月の巫女 セレーネ', 'Selene, Moon Shrine Maiden', '달의 무녀 셀레네', '月之巫女 塞勒涅', 'Selene, sacerdotisa lunar'],
    // ---- 設定 ----
    ['グラフィック', 'Graphics', '그래픽', '画面', 'Gráficos'], ['操作', 'Controls', '조작', '操作', 'Controles'], ['人格切り替え', 'Persona Switch', '인격 전환', '人格切换', 'Cambio de personalidad'],
    ['サウンド', 'Sound', '사운드', '声音', 'Sonido'], ['その他', 'Other', '기타', '其他', 'Otros'], ['画質プリセット', 'Quality preset', '화질 프리셋', '画质预设', 'Calidad predefinida'],
    ['低', 'Low', '낮음', '低', 'Baja'], ['中', 'Medium', '중간', '中', 'Media'], ['高', 'High', '높음', '高', 'Alta'], ['最高', 'Ultra', '최고', '最高', 'Ultra'], ['カスタム', 'Custom', '사용자 지정', '自定义', 'Personalizada'],
    ['描画距離', 'Draw distance', '그리기 거리', '绘制距离', 'Distancia de dibujado'], ['影の品質', 'Shadow quality', '그림자 품질', '阴影质量', 'Calidad de sombras'], ['オフ', 'Off', '끔', '关', 'No'], ['オン', 'On', '켬', '开', 'Sí'],
    ['ソフトシャドウ', 'Soft shadows', '소프트 섀도', '柔和阴影', 'Sombras suaves'], ['雲', 'Clouds', '구름', '云', 'Nubes'], ['高速', 'Fast', '빠름', '快速', 'Rápidas'], ['綺麗', 'Fancy', '고품질', '精美', 'Bonitas'],
    ['グラフィックス', 'Rendering', '그래픽스', '画面效果', 'Renderizado'], ['処理優先', 'Performance', '성능 우선', '性能优先', 'Rendimiento'], ['描画優先', 'Quality', '품질 우선', '画质优先', 'Calidad'],
    ['草の密度', 'Grass density', '풀 밀도', '草地密度', 'Densidad de hierba'], ['ウルトラ', 'Ultra', '울트라', '超高', 'Ultra'], ['木々の密度', 'Tree density', '나무 밀도', '树木密度', 'Densidad de árboles'],
    ['パーティクル', 'Particles', '파티클', '粒子', 'Partículas'], ['最小', 'Minimal', '최소', '最少', 'Mínimas'], ['減少', 'Reduced', '감소', '减少', 'Reducidas'], ['すべて', 'All', '전부', '全部', 'Todas'],
    ['アンチエイリアス', 'Anti-aliasing', '안티에일리어싱', '抗锯齿', 'Antialiasing'], ['ブルーム（光のにじみ）', 'Bloom', '블룸', '泛光', 'Resplandor'], ['キャラクターの輪郭線', 'Character outlines', '캐릭터 윤곽선', '角色轮廓线', 'Contorno de personajes'],
    ['レンダリング解像度', 'Render scale', '렌더링 해상도', '渲染分辨率', 'Escala de renderizado'], ['最大ピクセル密度', 'Max pixel ratio', '최대 픽셀 밀도', '最大像素密度', 'Densidad de píxeles máx.'],
    ['最大フレームレート', 'Max frame rate', '최대 프레임 레이트', '最大帧率', 'FPS máximos'], ['無制限', 'Unlimited', '무제한', '无限制', 'Sin límite'], ['視野角 (FOV)', 'Field of view (FOV)', '시야각 (FOV)', '视野 (FOV)', 'Campo de visión (FOV)'], ['明るさ', 'Brightness', '밝기', '亮度', 'Brillo'],
    ['マウス感度', 'Mouse sensitivity', '마우스 감도', '鼠标灵敏度', 'Sensibilidad del ratón'], ['上下反転', 'Invert Y', '상하 반전', '上下反转', 'Invertir eje Y'], ['画面の揺れ', 'Screen shake', '화면 흔들림', '画面震动', 'Vibración de pantalla'], ['UIの大きさ', 'UI scale', 'UI 크기', 'UI大小', 'Tamaño de la interfaz'],
    ['全体の音量', 'Master volume', '전체 음량', '总音量', 'Volumen general'], ['効果音', 'Sound effects', '효과음', '音效', 'Efectos'], ['ダメージ数値を表示', 'Show damage numbers', '대미지 수치 표시', '显示伤害数字', 'Mostrar daño'], ['FPSを表示', 'Show FPS', 'FPS 표시', '显示FPS', 'Mostrar FPS'],
    ['データ', 'Data', '데이터', '数据', 'Datos'], ['設定を初期化', 'Reset settings', '설정 초기화', '重置设置', 'Restablecer ajustes'], ['セーブデータを削除', 'Delete save data', '세이브 데이터 삭제', '删除存档', 'Borrar partida'], ['言語 / Language', 'Language', '언어 / Language', '语言 / Language', 'Idioma / Language'],
    // ---- 人格・属性 ----
    ['冒険者', 'Adventurer', '모험가', '冒险者', 'Aventurero'], ['採掘者', 'Miner', '채굴자', '采掘者', 'Minero'], ['飛翔者', 'Flyer', '비상자', '飞翔者', 'Volador'], ['俊足者', 'Sprinter', '준족자', '疾足者', 'Velocista'],
    ['覚醒者', 'Awakener', '각성자', '觉醒者', 'Despertado'], ['魔術者', 'Mage', '마술사', '魔术者', 'Mago'], ['回復者', 'Healer', '회복자', '治愈者', 'Sanador'], ['正直者', 'Honest One', '정직자', '正直者', 'Honesto'], ['超聴者', 'Hearer', '초청자', '超听者', 'Oyente'], ['予言者', 'Prophet', '예언자', '预言者', 'Profeta'],
    ['炎', 'Fire', '불', '火', 'Fuego'], ['水', 'Water', '물', '水', 'Agua'], ['風', 'Wind', '바람', '风', 'Viento'], ['氷', 'Ice', '얼음', '冰', 'Hielo'], ['雷', 'Thunder', '번개', '雷', 'Rayo'], ['岩', 'Earth', '바위', '岩', 'Tierra'], ['光', 'Light', '빛', '光', 'Luz'], ['闇', 'Dark', '어둠', '暗', 'Oscuridad'], ['魔', 'Arcane', '마', '魔', 'Arcano'], ['物理', 'Physical', '물리', '物理', 'Físico'],
    // ---- 地方・村 ----
    ['星風平原', 'Starwind Plains', '별바람 평원', '星风平原', 'Llanuras Vientoestelar'], ['翠樹の森', 'Emerald Forest', '비취 숲', '翠树之森', 'Bosque Esmeralda'], ['陽炎砂漠', 'Mirage Desert', '아지랑이 사막', '阳炎沙漠', 'Desierto Espejismo'],
    ['白銀氷原', 'Silver Tundra', '백은 빙원', '白银冰原', 'Tundra Plateada'], ['紅蓮火山', 'Crimson Volcano', '홍련 화산', '红莲火山', 'Volcán Carmesí'], ['平原超山', 'Skyreach Highlands', '평원 초산', '平原超山', 'Altiplano Cielo'],
    ['乾燥砂漠', 'Arid Wastes', '건조 사막', '干燥沙漠', 'Páramo Árido'], ['極光雪原', 'Aurora Snowfield', '극광 설원', '极光雪原', 'Nevero Aurora'], ['溶岩火山', 'Molten Caldera', '용암 화산', '熔岩火山', 'Caldera Fundida'],
    ['氷炎の境地', 'Frostfire Expanse', '빙염의 경지', '冰炎之境', 'Extensión Hielofuego'], ['霧氷の密林', 'Rimefrost Jungle', '상고대 밀림', '雾凇密林', 'Selva Escarcha'], ['黄昏サバンナ', 'Twilight Savanna', '황혼 사바나', '黄昏草原', 'Sabana Crepuscular'],
    ['雲海高原', 'Cloudsea Plateau', '운해 고원', '云海高原', 'Meseta Mar de Nubes'], ['星砂の浜', 'Starsand Shore', '별모래 해변', '星砂海滩', 'Costa Arenaestelar'], ['氷結の大海', 'Frozen Expanse', '빙결의 대해', '冰结大海', 'Mar Congelado'],
    ['蒼氷の氷河', 'Azure Glaciers', '창빙의 빙하', '苍冰冰川', 'Glaciares Azules'], ['氷の住む街', 'City of Ice', '얼음이 사는 도시', '冰之城', 'Ciudad de Hielo'],
    ['スターリーフ村', 'Starleaf Village', '스타리프 마을', '星叶村', 'Aldea Hojaestelar'], ['モリノハ集落', 'Morinoha Hamlet', '모리노하 마을', '森之叶聚落', 'Aldea Morinoha'], ['オアシス都市サンドリア', 'Oasis City Sandria', '오아시스 도시 산드리아', '绿洲都市珊德利亚', 'Ciudad oasis Sandria'],
    ['雪の里フロストヘイム', 'Frostheim, the Snow Village', '눈의 마을 프로스트하임', '雪之乡霜海姆', 'Frostheim, aldea nevada'], ['ボルカ前哨基地', 'Volca Outpost', '볼카 전초기지', '博尔卡前哨基地', 'Puesto Volca'],
    ['氷上の宿場 アイスロード', 'Iceroad, the Frozen Inn Town', '빙상의 역참 아이스로드', '冰上驿站 冰之路', 'Posada helada Iceroad'], ['氷河の野営地 グレイシア', 'Glacia, the Glacier Camp', '빙하의 야영지 글레이시아', '冰川营地 格雷西亚', 'Campamento glaciar Glacia'], ['氷の住む街 フロスティア', 'Frostia, the City of Ice', '얼음이 사는 도시 프로스티아', '冰之城 弗罗斯蒂亚', 'Frostia, la Ciudad de Hielo'],
    ['プラスタウン', 'Plus Town', '플러스 타운', '加号镇', 'Ciudad Plus'], ['月の門', 'Moon Gate', '달의 문', '月之门', 'Puerta Lunar'], ['氷の城塞', 'Ice Citadel', '얼음 성채', '冰之城塞', 'Ciudadela de Hielo'], ['タイプドラゴン', 'Type Dragon', '타입 드래곤', '属性巨龙', 'Dragón Tipo'],
    // ---- ガチャ・パス・ログイン ----
    ['1回引く', 'Pull ×1', '1회 뽑기', '抽1次', 'Tirar ×1'], ['10回引く', 'Pull ×10', '10회 뽑기', '抽10次', 'Tirar ×10'], ['無料で1回引く', 'Free pull ×1', '무료 1회 뽑기', '免费抽1次', 'Tirada gratis ×1'],
    ['チケットで1回', 'Ticket ×1', '티켓으로 1회', '用券抽1次', 'Ticket ×1'], ['チケットで10回', 'Tickets ×10', '티켓으로 10회', '用券抽10次', 'Tickets ×10'], ['★3以上 1つ確定', '1× ★3+ guaranteed', '★3 이상 1개 확정', '必出1个★3以上', '1 ★3+ garantizado'],
    ['提供割合・内容', 'Rates & contents', '제공 비율·내용', '概率与内容', 'Probabilidades y contenido'], ['所持スターコイン', 'Star Coins owned', '보유 스타 코인', '持有星币', 'Monedas'], ['ミラクルチケット', 'Miracle Ticket', '미라클 티켓', '奇迹券', 'Ticket Milagro'],
    ['★5確定まで', 'Until ★5 guaranteed', '★5 확정까지', '距离★5保底', 'Hasta ★5 asegurado'], ['これまでに引いた回数', 'Total pulls', '지금까지 뽑은 횟수', '累计抽取次数', 'Tiradas totales'], ['スキップ ▶▶', 'Skip ▶▶', '건너뛰기 ▶▶', '跳过 ▶▶', 'Saltar ▶▶'],
    ['もう一度引く', 'Pull again', '다시 뽑기', '再抽一次', 'Tirar otra vez'], ['食料', 'Food', '음식', '食物', 'Comida'], ['素材', 'Material', '소재', '素材', 'Material'], ['武器', 'Weapon', '무기', '武器', 'Arma'], ['人格の新衣装', 'New outfit', '인격의 새 의상', '人格新服装', 'Atuendo nuevo'], ['キャラ', 'Character', '캐릭터', '角色', 'Personaje'],
    ['購入する', 'Buy', '구매하기', '购买', 'Comprar'], ['30日延長する', 'Extend 30 days', '30일 연장하기', '延长30天', 'Ampliar 30 días'], ['プラスタウンへ行く', 'Go to Plus Town', '플러스 타운으로 가기', '前往加号镇', 'Ir a Ciudad Plus'], ['有効', 'Active', '유효', '有效', 'Activo'], ['未加入', 'Not joined', '미가입', '未加入', 'No unido'],
    ['受け取る', 'Claim', '받기', '领取', 'Recibir'], ['受取済', 'Claimed', '수령 완료', '已领取', 'Recibido'], ['いつもの服', 'Usual clothes', '평소 옷', '平常的衣服', 'Ropa habitual'], ['着用中', 'Wearing', '착용 중', '穿着中', 'Puesto'],
    ['最大レベル 100 → 120', 'Max level 100 → 120', '최대 레벨 100 → 120', '等级上限 100 → 120', 'Nivel máx. 100 → 120'], ['ミラクルガチャ 一日一回無料', 'Free Miracle Gacha pull every day', '미라클 가챠 하루 한 번 무료', '奇迹扭蛋每日免费一次', 'Una tirada gratis al día'],
    ['週に一回 ヨミガエクリスタル', 'A Revival Crystal every week', '일주일에 한 번 부활의 크리스탈', '每周一个复苏水晶', 'Un Cristal de Resurrección cada semana'], ['新地「プラスタウン」', 'New area: Plus Town', '새 지역 「플러스 타운」', '新区域「加号镇」', 'Nueva zona: Ciudad Plus'],
    // ---- 調べる・その他 ----
    ['宝箱を開ける', 'Open chest', '보물상자 열기', '打开宝箱', 'Abrir cofre'], ['星の像に祈る', 'Pray at the star statue', '별의 석상에 기도하기', '向星之像祈祷', 'Rezar a la estatua'], ['ワープポイントを解放する', 'Unlock warp point', '워프 포인트 해방', '解锁传送点', 'Activar punto de teletransporte'],
    ['迷宮から出る', 'Leave the labyrinth', '미궁에서 나가기', '离开迷宫', 'Salir del laberinto'], ['外へ戻る', 'Go back outside', '밖으로 돌아가기', '返回外面', 'Volver al exterior'], ['星の泉で休む', 'Rest at the star spring', '별의 샘에서 쉬기', '在星之泉休息', 'Descansar en la fuente'],
    ['ミラクルガチャを引く', 'Pull the Miracle Gacha', '미라클 가챠 뽑기', '抽奇迹扭蛋', 'Tirar del Gacha Milagro'], ['夜島へ渡る（月の門）', 'Cross to Night Island (Moon Gate)', '밤의 섬으로 건너가기 (달의 문)', '前往夜岛（月之门）', 'Cruzar a la Isla Nocturna'], ['夜島へ戻る', 'Back to Night Island', '밤의 섬으로 돌아가기', '返回夜岛', 'Volver a la Isla Nocturna'],
    ['スターリーフ村へ戻る', 'Back to Starleaf Village', '스타리프 마을로 돌아가기', '返回星叶村', 'Volver a Hojaestelar'], ['スターリーフ村へ戻る（月の門）', 'Back to Starleaf Village (Moon Gate)', '스타리프 마을로 돌아가기 (달의 문)', '返回星叶村（月之门）', 'Volver a Hojaestelar (Puerta Lunar)'],
    ['プラスゲート（プラスパス専用）', 'Plus Gate (Plus Pass only)', '플러스 게이트 (플러스 패스 전용)', '加号之门（通行证专用）', 'Puerta Plus (solo Pase Plus)'], ['冒険を続ける', 'Continue the adventure', '모험 계속하기', '继续冒险', 'Seguir la aventura'], ['第五章へ ▶', 'To Chapter 5 ▶', '제5장으로 ▶', '前往第五章 ▶', 'Al capítulo 5 ▶'],
    ['シールド解除！', 'Shield broken!', '실드 해제!', '护盾解除！', '¡Escudo roto!'], ['今がチャンスだ！', 'Now\'s your chance!', '지금이 기회다!', '就是现在！', '¡Es tu oportunidad!'], ['QUEST CLEAR', 'QUEST CLEAR', 'QUEST CLEAR', 'QUEST CLEAR', 'QUEST CLEAR'],
    ['横向きにしてプレイしてください', 'Please rotate your device to landscape', '기기를 가로로 돌려 플레이해 주세요', '请将设备横屏游玩', 'Gira tu dispositivo en horizontal'],
    ['スマホの縦画面ではプレイできません。端末を横向きにすると、そのまま続きから遊べます。', 'This game cannot be played in portrait mode. Turn your device sideways to keep playing.', '스마트폰 세로 화면에서는 플레이할 수 없습니다. 기기를 가로로 돌리면 바로 이어서 플레이할 수 있습니다.', '手机竖屏无法游玩。将设备横过来即可继续游戏。', 'No se puede jugar en vertical. Gira el dispositivo para seguir jugando.']
  ];
  const PAT = [
    [/^推奨レベル (\d+)〜(\d+)$/, ['Recommended Lv $1–$2', '권장 레벨 $1~$2', '推荐等级 $1～$2', 'Nivel recomendado $1–$2']],
    [/^推奨レベル (\d+)$/, ['Recommended Lv $1', '권장 레벨 $1', '推荐等级 $1', 'Nivel recomendado $1']],
    [/^拾う：(.+)$/, ['Pick up: $1', '줍기: $1', '拾取：$1', 'Recoger: $1']],
    [/^話しかける：(.+)$/, ['Talk: $1', '말 걸기: $1', '交谈：$1', 'Hablar: $1']],
    [/^ワープポイント：(.+)$/, ['Warp point: $1', '워프 포인트: $1', '传送点：$1', 'Teletransporte: $1']],
    [/^(?:迷宮|遺跡|ダンジョン)に入る：(.+)$/, ['Enter: $1', '들어가기: $1', '进入：$1', 'Entrar: $1']],
    [/^応用ダンジョンに入る：(.+)$/, ['Enter advanced dungeon: $1', '응용 던전 입장: $1', '进入进阶地下城：$1', 'Mazmorra avanzada: $1']],
    [/^挑む：(.+)$/, ['Challenge: $1', '도전: $1', '挑战：$1', 'Desafiar: $1']],
    [/^ヒント：(.+)$/, ['Tip: $1', '팁: $1', '提示：$1', 'Consejo: $1']],
    [/^あと (\d+) 回$/, ['$1 more', '앞으로 $1회', '还剩 $1 次', 'Faltan $1']],
    [/^(\d+) 回$/, ['$1 pulls', '$1회', '$1 次', '$1 tiradas']],
    [/^(\d+)日目$/, ['Day $1', '$1일째', '第$1天', 'Día $1']],
    [/^(.+)（正式版）$/, ['$1 (Official)', '$1 (정식판)', '$1（正式版）', '$1 (Oficial)']],
    [/^冒険者ID (.+)$/, ['Adventurer ID $1', '모험가 ID $1', '冒险者ID $1', 'ID de aventurero $1']]
  ];
  const DICT = new Map(); for (const r of T) if (!DICT.has(r[0])) DICT.set(r[0], r);
  const JP = /[぀-ヿ㐀-鿿！-｠]/;
  const I = PS.I18N = { LANGS, lang: 'ja' };
  try { const s = JSON.parse(localStorage.getItem('ps_settings_v1') || 'null'); if (s && IDX[s.lang] != null) I.lang = s.lang; } catch (e) { }
  I.t = function (str) {
    if (I.lang === 'ja' || !str || !JP.test(str)) return str;
    const li = IDX[I.lang], lead = str.match(/^\s*/)[0], trail = str.match(/\s*$/)[0], core = str.trim();
    const r = DICT.get(core); if (r) return lead + r[li] + trail;
    for (const [re, out] of PAT) { const m = re.exec(core); if (m) return lead + out[li - 1].replace(/\$(\d)/g, (_, k) => I.t(m[+k])) + trail; }
    return str;
  };
  // ---- 画面の文字を置きかえる（元の日本語は覚えておき、言語を変えたら戻して置きかえ直す） ----
  const ORIG = new WeakMap();
  const tNode = (n) => {
    const cur = n.nodeValue; if (!cur) return;
    let o = ORIG.get(n); if (o == null || (cur !== o.out)) { o = { src: cur, out: null }; }
    const out = I.t(o.src); o.out = out; ORIG.set(n, o); if (out !== cur) n.nodeValue = out;
  };
  const tAttr = (el) => { for (const a of ['title', 'placeholder']) { const v = el.getAttribute && el.getAttribute(a); if (v && JP.test(v)) { const k = 'data-ja-' + a; if (!el.hasAttribute(k)) el.setAttribute(k, v); el.setAttribute(a, I.t(el.getAttribute(k))); } } };
  const walk = (root) => {
    if (root.nodeType === 3) return tNode(root);
    if (root.nodeType !== 1 || root.tagName === 'SCRIPT' || root.tagName === 'STYLE' || root.tagName === 'CANVAS') return;
    tAttr(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) tNode(n); else tAttr(n); }
  };
  let obs = null;
  I.apply = function () {
    if (!document.body) return;
    if (I.lang === 'ja') {
      // 日本語に戻す
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n;
      while ((n = w.nextNode())) { if (n.nodeType === 3) { const o = ORIG.get(n); if (o && n.nodeValue === o.out) n.nodeValue = o.src; ORIG.delete(n); } else for (const a of ['title', 'placeholder']) { const k = 'data-ja-' + a; if (n.hasAttribute && n.hasAttribute(k)) n.setAttribute(a, n.getAttribute(k)); } }
      if (obs) { obs.disconnect(); obs = null; }
      document.documentElement.lang = 'ja'; return;
    }
    document.documentElement.lang = I.lang;
    walk(document.body);
    if (!obs) {
      obs = new MutationObserver((list) => {
        if (I.lang === 'ja') return;
        for (const m of list) {
          if (m.type === 'characterData') { const n = m.target, o = ORIG.get(n); if (!o || n.nodeValue !== o.out) tNode(n); }
          else for (const n of m.addedNodes) walk(n);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  };
  I.set = function (lang) {
    if (IDX[lang] == null) return;
    I.lang = lang; if (PS.Settings) { PS.Settings.lang = lang; PS.saveSettings && PS.saveSettings(); }
    I.apply();
  };
  // 地図などキャンバスに描く文字
  const wrapCtx = (name) => { const f = CanvasRenderingContext2D.prototype[name]; CanvasRenderingContext2D.prototype[name] = function (txt, ...a) { return f.call(this, I.lang !== 'ja' && typeof txt === 'string' ? I.t(txt) : txt, ...a); }; };
  if (window.CanvasRenderingContext2D) { wrapCtx('fillText'); wrapCtx('strokeText'); }
  document.addEventListener('DOMContentLoaded', () => { if (I.lang !== 'ja') I.apply(); });

  // ---- スマホ・タブレットの案内（各言語） ----
  I.guide = {
    en: ['If you are playing on a smartphone or tablet', `<p>Thank you very much for playing Personality Stars (Personalities and Stars). We would like to share how to enjoy our new game, Personality Stars, to the fullest.</p>
      <h3>① For players on smartphones, tablets and other devices</h3><p>We recommend playing with Google Chrome or Microsoft Edge (Apple Safari on iOS devices). Tap your browser's share button, choose “Add to Home Screen” and add it — you can then open the game whenever you like and play in full screen. Adjusting settings such as graphics quality to suit your device's specs may make the game even more comfortable to play.</p>
      <h3>② For players on a computer</h3><p>We recommend Google Chrome, Microsoft Edge, Mozilla Firefox or similar browsers. If you play in this environment, we recommend adding the game to your bookmarks and playing in full screen.</p><p>On Windows, press the F11 key for full screen (there are exceptions); on Mac, press Control + Command + F at the same time.</p>
      <h3>③ Finally</h3><p>This game was made so that everyone who plays it can have fun. Please check the Terms of Use and the License before playing. We are also planning, step by step, to release the game as an app on the stores and as software for PC. It is still a gradual process, but we will keep developing with all our effort for each and every one of you who plays. Thank you for your continued support.</p><p class="mg-sign">— All developers of YUKIGROUP</p>`],
    ko: ['스마트폰·태블릿으로 플레이하는 경우에 대하여', `<p>이번에 퍼스낼리티 스타즈(인격과 별)를 플레이해 주셔서 진심으로 감사드립니다. 새로운 게임 퍼스낼리티 스타즈를 즐겁게 플레이하는 방법을 알려 드리고자 합니다.</p>
      <h3>① 스마트폰·태블릿 등의 기기로 플레이하시는 분</h3><p>Google의 Chrome이나 Microsoft의 Edge(iOS 계열이라면 Apple의 Safari)를 사용해 플레이하시기를 권장합니다. 브라우저의 공유 버튼을 누르고 【홈 화면에 추가】를 눌러 추가하면, 언제든 원할 때 열어 전체 화면으로 플레이할 수 있습니다. 또한 자신의 기기 사양을 확인한 뒤 설정에서 화질 등을 조정하면 더욱 쾌적하게 플레이할 수 있습니다.</p>
      <h3>② PC 환경에서 플레이하시는 분</h3><p>Google의 Chrome, Microsoft의 Edge, 그리고 Mozilla Foundation의 Firefox 등을 사용해 플레이하시기를 권장합니다. 또한 이 환경에서 플레이하시는 분은 북마크에 추가하고 전체 화면으로 플레이하시기를 추천합니다.</p><p>전체 화면은 Windows에서는 F11 키(예외가 있을 수 있음), Mac에서는 Control + Command + F 키를 동시에 눌러 전환할 수 있습니다.</p>
      <h3>③ 마지막으로</h3><p>이 게임은 플레이해 주시는 모든 분들이 즐길 수 있도록 만들어졌습니다. 이용 약관과 라이선스를 확인한 후 플레이해 주시기 바랍니다. 또한 이 게임은 단계적으로 스토어 앱 출시와 PC 소프트웨어 전개를 예정하고 있습니다. 아직 단계적이지만, 플레이해 주시는 한 분 한 분을 위해 최선을 다해 개발하겠습니다. 앞으로도 잘 부탁드립니다.</p><p class="mg-sign">YUKIGROUP 개발자 일동</p>`],
    zh: ['关于使用手机或平板电脑游玩', `<p>衷心感谢您游玩《人格之星（Personality Stars）》。在此，我们想向您介绍如何更愉快地游玩新游戏《人格之星》。</p>
      <h3>① 使用手机、平板电脑等设备游玩的玩家</h3><p>推荐使用 Google 的 Chrome 或 Microsoft 的 Edge（iOS 设备请使用 Apple 的 Safari）进行游玩。点击浏览器的分享按钮，选择【添加到主屏幕】并添加后，即可随时打开，并以全屏方式游玩。此外，在确认自己设备的性能后，在设置中调整画质等选项，可能会玩得更加流畅。</p>
      <h3>② 使用电脑游玩的玩家</h3><p>推荐使用 Google 的 Chrome、Microsoft 的 Edge 以及 Mozilla 基金会的 Firefox 等浏览器游玩。另外，建议在此环境下游玩的玩家将本游戏添加到书签，并以全屏模式游玩。</p><p>全屏显示：Windows 环境请按 F11 键（存在例外情况），Mac 环境请同时按下 Control + Command + F 键。</p>
      <h3>③ 最后</h3><p>本游戏是为了让每一位玩家都能玩得开心而制作的。请在确认使用条款和许可协议后再进行游玩。此外，本游戏计划逐步在应用商店以 App 形式上架，并在电脑上以软件形式推出。虽然仍在逐步推进中，但我们会为每一位玩家全力以赴地进行开发，今后也请多多关照。</p><p class="mg-sign">YUKIGROUP 全体开发人员</p>`],
    es: ['Si juegas en un smartphone o una tableta', `<p>Muchas gracias por jugar a Personality Stars (Personalidades y Estrellas). Queremos contarte cómo disfrutar al máximo de nuestro nuevo juego, Personality Stars.</p>
      <h3>① Si juegas en un smartphone, una tableta u otro dispositivo</h3><p>Te recomendamos jugar con Google Chrome o Microsoft Edge (en dispositivos iOS, Safari de Apple). Pulsa el botón de compartir del navegador, elige «Añadir a la pantalla de inicio» y añádelo: así podrás abrir el juego cuando quieras y jugar a pantalla completa. Además, si ajustas la calidad gráfica y otras opciones en los ajustes según las especificaciones de tu dispositivo, es posible que juegues con mayor fluidez.</p>
      <h3>② Si juegas en un ordenador</h3><p>Te recomendamos usar Google Chrome, Microsoft Edge o Mozilla Firefox, entre otros. Si juegas en este entorno, te recomendamos añadir el juego a tus marcadores y jugar a pantalla completa.</p><p>Para la pantalla completa, en Windows pulsa la tecla F11 (hay excepciones) y en Mac pulsa a la vez Control + Comando + F.</p>
      <h3>③ Por último</h3><p>Este juego se ha creado para que todas las personas que lo juegan puedan divertirse. Te pedimos que consultes los Términos de uso y la Licencia antes de jugar. Además, tenemos previsto, de forma gradual, publicar el juego como aplicación en las tiendas y como software para PC. Aunque todavía es un proceso gradual, seguiremos desarrollándolo con todo nuestro esfuerzo por cada una de las personas que juegan. ¡Muchas gracias por tu apoyo!</p><p class="mg-sign">Todo el equipo de desarrollo de YUKIGROUP</p>`]
  };
})(window.PS);
