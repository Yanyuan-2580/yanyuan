<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50/40 via-white to-soft-50/30 py-8 px-4 animate-page-enter">
    <div class="max-w-4xl mx-auto">
      <!-- 标题 -->
      <div class="relative text-center mb-8 pt-6">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-calm-200/30 to-emerald-100/20 rounded-full blur-3xl pointer-events-none" />
        <h1 class="relative text-3xl font-bold text-gray-800 mb-2">冥想疗愈</h1>
        <p class="relative text-gray-500">静下心来，找回内心的平静</p>
      </div>

      <!-- 加载骨架 -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-card p-4 text-center animate-pulse">
            <div class="h-8 w-16 bg-gray-200 rounded mx-auto mb-1" />
            <div class="h-4 w-12 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-card p-4 mb-6 animate-pulse">
          <div class="flex gap-2">
            <div v-for="i in 5" :key="i" class="h-9 w-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-card p-6 animate-pulse">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-5 w-24 bg-gray-200 rounded" />
                <div class="h-4 w-full bg-gray-200 rounded" />
                <div class="flex gap-3">
                  <div class="h-4 w-16 bg-gray-200 rounded" />
                  <div class="h-5 w-12 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-calm-600">{{ stats.totalSessions || 0 }}</div>
          <div class="text-sm text-gray-500">练习次数</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-calm-600">{{ formatDuration(stats.totalDuration) }}</div>
          <div class="text-sm text-gray-500">总时长</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-emerald-500">{{ stats.completedCount || 0 }}</div>
          <div class="text-sm text-gray-500">完成次数</div>
        </div>
        <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 text-center hover:shadow-card-hover transition-shadow">
          <div class="text-2xl font-bold text-violet-500">{{ stats.avgDuration || '0' }}分钟</div>
          <div class="text-sm text-gray-500">平均时长</div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="bg-white rounded-2xl shadow-card border border-gray-50 p-5 mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            @click="selectedCategory = ''"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === ''
                ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600'
            ]"
          >
            全部
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
              selectedCategory === cat
                ? 'bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-calm-200 hover:text-calm-600'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 冥想课程列表 -->
      <div v-if="filteredMeditations.length === 0" class="text-center py-16">
        <span class="text-5xl block mb-4">🧘</span>
        <p class="text-gray-500">该分类暂无冥想课程</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="meditation in filteredMeditations"
          :key="meditation.id"
          @click="playMeditation(meditation)"
          class="bg-white rounded-2xl shadow-card border border-gray-50 p-6 cursor-pointer hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-calm-400 to-calm-500 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              🧘
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 truncate">{{ meditation.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ meditation.description }}</p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-sm text-gray-400">⏱️ {{ meditation.duration }}分钟</span>
                <span class="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-500">{{ meditation.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      </template>

      <!-- 播放弹窗 -->
      <div
        v-if="playingMeditation"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-50 p-8 max-w-md w-full">
          <div class="text-center">
            <!-- 动画呼吸圈 -->
            <div class="relative w-28 h-28 mx-auto mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-calm-400 to-emerald-500 rounded-full opacity-20"
                :class="{ 'animate-ping': isPlaying }" />
              <div class="absolute inset-0 bg-gradient-to-br from-calm-400 to-calm-500 rounded-full flex items-center justify-center text-5xl"
                :class="{ 'scale-110': isPlaying }" style="transition: transform 4s ease-in-out">
                🧘
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-1">{{ playingMeditation.title }}</h3>
            <p class="text-sm text-gray-400 mb-6">{{ playingMeditation.description }}</p>

            <!-- 背景音选择 -->
            <div class="mb-5">
              <p class="text-xs text-gray-400 mb-2">背景音</p>
              <div class="flex justify-center gap-2">
                <button
                  v-for="sound in ambientSounds"
                  :key="sound.type"
                  @click="switchAmbientSound(sound.type)"
                  :class="[
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    currentSound === sound.type
                      ? 'bg-calm-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                >
                  {{ sound.emoji }} {{ sound.label }}
                </button>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-500 mb-2">
                <span>{{ formatTime(elapsedTime) }}</span>
                <span>{{ formatTime(playingMeditation.duration * 60) }}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-calm-500 to-emerald-500 transition-all duration-1000"
                  :style="{ width: `${(elapsedTime / (playingMeditation.duration * 60)) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="flex justify-center gap-4">
              <button
                @click="togglePlay"
                class="w-16 h-16 rounded-full bg-gradient-to-r from-calm-500 to-emerald-500 text-white shadow-lg flex items-center justify-center text-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                {{ isPlaying ? '⏸️' : '▶️' }}
              </button>
            </div>

            <button
              @click="exitMeditation"
              class="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              结束冥想
            </button>
          </div>
        </div>
      </div>
    </div>
    <BottomNavBar active-tab="user" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { meditationApi } from '@/api/modules/meditation';
import BottomNavBar from '@/components/BottomNavBar.vue';

const categories = ['放松', '睡眠', '专注', '情绪调节'];
const selectedCategory = ref('');
const meditations = ref<any[]>([]);
const stats = ref<any>({});
const isLoading = ref(true);

// 播放状态
const playingMeditation = ref<any>(null);
const isPlaying = ref(false);
const elapsedTime = ref(0);
let timer: number | null = null;

// ====== Web Audio 环境音 ======
const ambientSounds = [
  { type: 'bell', label: '冥想钟声', emoji: '🔔' },
  { type: 'piano', label: '轻缓钢琴', emoji: '🎹' },
  { type: 'pad', label: '空灵音垫', emoji: '🎵' },
  { type: 'rain', label: '雨声', emoji: '🌧️' },
  { type: 'ocean', label: '海浪', emoji: '🌊' },
  { type: 'forest', label: '森林', emoji: '🌿' },
  { type: 'whitenoise', label: '白噪音', emoji: '💨' },
  { type: 'none', label: '静音', emoji: '🔇' },
];
const currentSound = ref('piano');
let audioCtx: AudioContext | null = null;
let soundNodes: AudioNode[] = [];
let masterGain: GainNode | null = null;

// 创建主音量控制器（带淡入淡出）
const createMasterGain = (ctx: AudioContext): GainNode => {
  const g = ctx.createGain();
  g.gain.value = 0;
  g.connect(ctx.destination);
  // 淡入
  const now = ctx.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.25, now + 1.5);
  masterGain = g;
  return g;
};

// ---- 轻缓音乐 ----

/** 冥想钟声 — 五声音阶周期性敲击 */
const createBellSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  // 五声音阶 (C D E G A)
  const pentatonic = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  let noteIdx = 0;

  const scheduleBell = () => {
    if (!ctx || ctx.state === 'closed') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = pentatonic[noteIdx % pentatonic.length];
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 3.0);
    nodes.push(osc, gain);
    noteIdx++;
  };

  scheduleBell();
  const interval = setInterval(scheduleBell, 4000 + Math.random() * 2000);
  (nodes as any).__interval = interval;
  return nodes;
};

/** 轻缓钢琴 — 五声音阶悠长旋律 */
const createPianoSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  // 五声音阶 (A3 到 A5)
  const scale = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37, 659.25, 739.99, 880];
  // 舒缓的旋律序列 [音阶索引, 时长(秒)]
  const melody: [number, number][] = [
    [3, 2.0], [5, 1.5], [7, 2.5], [6, 1.0], [5, 2.0],
    [3, 2.0], [2, 1.5], [3, 3.0],
    [4, 1.5], [5, 1.5], [7, 2.0], [6, 1.0], [3, 2.5],
    [2, 1.5], [0, 3.0],
  ];
  let step = 0;
  let currentOsc: OscillatorNode | null = null;
  let currentGain: GainNode | null = null;

  const playNote = () => {
    if (!ctx || ctx.state === 'closed') return;
    const [scaleIdx, duration] = melody[step % melody.length];
    const freq = scale[Math.min(scaleIdx, scale.length - 1)];

    currentOsc = ctx.createOscillator();
    currentGain = ctx.createGain();
    // 柔和的三角波模拟钢琴
    currentOsc.type = 'triangle';
    currentOsc.frequency.value = freq;
    // 添加泛音（八度上方）
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = freq * 2;
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.06;

    const now = ctx.currentTime;
    // ADSR 包络
    currentGain.gain.setValueAtTime(0, now);
    currentGain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    currentGain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
    currentGain.gain.linearRampToValueAtTime(0.001, now + duration * 0.9);

    currentOsc.connect(currentGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(master);
    currentGain.connect(master);

    currentOsc.start(now);
    currentOsc.stop(now + duration);
    overtone.start(now);
    overtone.stop(now + duration);
    nodes.push(currentOsc, currentGain, overtone, overtoneGain);

    step++;
    setTimeout(playNote, duration * 1000 + 200);
  };

  // 铺垫低频持续音
  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 110; // A2
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.04;
  drone.connect(droneGain);
  droneGain.connect(master);
  drone.start();
  nodes.push(drone, droneGain);

  playNote();
  return nodes;
};

/** 空灵音垫 — 叠加谐波的长持续和弦 */
const createPadSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  // 和弦音 (C大九和弦: C E G B D)
  const chord = [130.81, 164.81, 196, 246.94, 293.66];
  // 每组稍微偏移产生宽广感
  const detuneCents = [0, 3, -2, 5, -4];

  for (let i = 0; i < chord.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = chord[i];
    osc.detune.value = detuneCents[i];

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.04;

    // 缓慢的 LFO 音量调制
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08 + i * 0.015; // 不同节奏
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(oscGain.gain);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start();
    lfo.start();
    nodes.push(osc, oscGain, lfo, lfoGain);
  }
  return nodes;
};

// ---- 自然音效 ----

const createRainSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 400;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 8000;
  source.connect(hp); hp.connect(lp); lp.connect(master);
  source.start();
  nodes.push(source, hp, lp);
  return nodes;
};

const createOceanSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer; noise.loop = true;
  const lfo = ctx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.4;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 600;
  lfo.connect(lfoGain); lfoGain.connect(master.gain);
  noise.connect(lp); lp.connect(master);
  noise.start(); lfo.start();
  nodes.push(noise, lfo, lfoGain, lp);
  return nodes;
};

const createForestSound = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (lastOut + 0.02 * (Math.random() * 2 - 1)) / 1.02 * 0.1;
    lastOut = data[i];
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer; source.loop = true;
  const chirp = ctx.createOscillator();
  chirp.type = 'sine'; chirp.frequency.value = 2400;
  const chirpGain = ctx.createGain(); chirpGain.gain.value = 0;
  const lfo = ctx.createOscillator();
  lfo.type = 'square'; lfo.frequency.value = 0.4;
  lfo.connect(chirpGain.gain);
  chirp.connect(chirpGain); chirpGain.connect(master);
  source.connect(master);
  source.start(); chirp.start(); lfo.start();
  nodes.push(source, chirp, chirpGain, lfo);
  return nodes;
};

const createWhiteNoise = (ctx: AudioContext): AudioNode[] => {
  const nodes: AudioNode[] = [];
  const master = createMasterGain(ctx);
  nodes.push(master);
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
  const source = ctx.createBufferSource();
  source.buffer = buffer; source.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 3000;
  source.connect(lp); lp.connect(master);
  source.start();
  nodes.push(source, lp);
  return nodes;
};

const stopAmbientSound = () => {
  for (const node of soundNodes) {
    try { clearInterval((node as any).__interval); } catch { /* */ }
    try { (node as any).stop?.(); } catch { /* */ }
    try { node.disconnect(); } catch { /* */ }
  }
  soundNodes = [];
  masterGain = null;
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close().catch(() => {});
  }
  audioCtx = null;
};

const startAmbientSound = (type: string) => {
  stopAmbientSound();
  if (type === 'none') return;
  audioCtx = new AudioContext();
  switch (type) {
    case 'bell': soundNodes = createBellSound(audioCtx); break;
    case 'piano': soundNodes = createPianoSound(audioCtx); break;
    case 'pad': soundNodes = createPadSound(audioCtx); break;
    case 'rain': soundNodes = createRainSound(audioCtx); break;
    case 'ocean': soundNodes = createOceanSound(audioCtx); break;
    case 'forest': soundNodes = createForestSound(audioCtx); break;
    case 'whitenoise': soundNodes = createWhiteNoise(audioCtx); break;
  }
};

const switchAmbientSound = (type: string) => {
  currentSound.value = type;
  if (playingMeditation.value) {
    startAmbientSound(type);
  }
};

const filteredMeditations = computed(() => {
  if (!selectedCategory.value) return meditations.value;
  return meditations.value.filter(m => m.category === selectedCategory.value);
});

// 服务端存储的 duration 单位是分钟
const formatDuration = (totalMinutes: number) => {
  if (!totalMinutes || totalMinutes <= 0) return '0分钟';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// elapsedTime 单位是秒，用于播放进度显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

// 根据冥想分类自动匹配最佳背景音
const categorySoundMap: Record<string, string> = {
  '放松': 'pad',
  '睡眠': 'rain',
  '专注': 'bell',
  '情绪调节': 'piano',
};

const playMeditation = (meditation: any) => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  playingMeditation.value = meditation;
  isPlaying.value = true;
  elapsedTime.value = 0;
  // 根据冥想分类自动选择最佳背景音，用户可手动切换
  const autoSound = categorySoundMap[meditation.category] || 'piano';
  currentSound.value = autoSound;
  startAmbientSound(autoSound);

  timer = window.setInterval(() => {
    if (isPlaying.value && elapsedTime.value < meditation.duration * 60) {
      elapsedTime.value++;
    } else if (elapsedTime.value >= meditation.duration * 60) {
      stopPlayback();
    }
  }, 1000);
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (audioCtx) {
    if (isPlaying.value) {
      audioCtx.resume().catch(() => {});
    } else {
      audioCtx.suspend().catch(() => {});
    }
  }
};

const stopPlayback = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isPlaying.value = false;

  if (playingMeditation.value && elapsedTime.value > 0) {
    const durationMinutes = Math.round(elapsedTime.value / 60);
    meditationApi.recordMeditation(playingMeditation.value.id, durationMinutes);
  }

  stopAmbientSound();
  playingMeditation.value = null;
  elapsedTime.value = 0;
};

const exitMeditation = () => {
  stopPlayback();
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const [medRes, statsRes] = await Promise.all([
      meditationApi.getAllMeditations(),
      meditationApi.getMeditationStats()
    ]);
    if (medRes.code === 200) {
      meditations.value = medRes.data || [];
    }
    if (statsRes.code === 200) {
      stats.value = statsRes.data || {};
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  stopPlayback();
  stopAmbientSound();
});
</script>