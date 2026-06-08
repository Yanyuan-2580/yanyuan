import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

export interface MatchResult {
  roomId: string;
  peerId: number;
  peerNickname: string;
  mode: 'text' | 'video';
}

export interface OnlineUser {
  userId: number;
  nickname: string;
}

export function useVideoSignal() {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const onlineUsers = ref<OnlineUser[]>([]);
  const isMatching = ref(false);
  const matchResult = ref<MatchResult | null>(null);
  const queueSize = ref(0);
  const incomingCall = ref<{ fromUserId: number; fromNickname: string; requestId: string } | null>(null);
  const callAccepted = ref<{ roomId: string; peerId: number } | null>(null);
  const peerHungUp = ref(false);
  const matchable = ref(false);
  const matchInvite = ref<{ fromUserId: number; fromNickname: string; roomId: string; preference: string } | null>(null);
  const isInviting = ref(false);

  const connect = (token: string) => {
    if (socket.value?.connected) return;

    const ws = io('/video', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    ws.on('connect', () => {
      isConnected.value = true;
      // 注册在线：从 localStorage 读取用户信息
      let nickname = '匿名用户';
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          nickname = user.nickname || user.username || '匿名用户';
        }
      } catch { /* */ }
      ws.emit('online:register', { nickname });

      // 恢复可匹配开关状态
      const savedMatchable = localStorage.getItem('video_matchable');
      if (savedMatchable === 'true') {
        matchable.value = true;
        ws.emit('match:toggle', { enabled: true });
      }
    });

    ws.on('disconnect', () => {
      isConnected.value = false;
    });

    // 在线用户列表
    ws.on('user:online', (users: OnlineUser[]) => {
      onlineUsers.value = users;
    });

    // 匹配成功
    ws.on('match:found', (result: MatchResult) => {
      isMatching.value = false;
      matchResult.value = result;
    });

    // 来电
    ws.on('call:incoming', (data: { fromUserId: number; fromNickname: string; requestId: string }) => {
      incomingCall.value = data;
    });

    // 请求被接受
    ws.on('call:accepted', (data: { roomId: string; peerId: number }) => {
      callAccepted.value = data;
      incomingCall.value = null;
    });

    // 请求被拒绝
    ws.on('call:rejected', () => {
      incomingCall.value = null;
    });

    // 对方挂断
    ws.on('call:peerHungUp', () => {
      peerHungUp.value = true;
    });

    // 被动匹配邀请
    ws.on('match:invite', (data: any) => {
      matchInvite.value = data;
    });

    // 邀请被拒，自动重试
    ws.on('match:inviteRejected', () => {
      // 旧逻辑，保留兼容
    });

    // 正在重试
    ws.on('match:retrying', (data: { message: string }) => {
      isInviting.value = true;
    });

    // 无可用用户
    ws.on('match:noAvailable', (data: { message: string }) => {
      isInviting.value = false;
    });

    // 正在邀请中
    ws.on('match:inviting', () => {
      isInviting.value = true;
    });

    socket.value = ws;
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
    isConnected.value = false;
  };

  const joinMatch = (preference: 'text' | 'video' | 'both') => {
    if (!socket.value) return;
    isMatching.value = true;
    matchResult.value = null;
    socket.value.emit('match:join', { preference });
  };

  const leaveMatch = () => {
    if (!socket.value) return;
    isMatching.value = false;
    socket.value.emit('match:leave');
  };

  const callRequest = (toUserId: number) => {
    if (!socket.value) return;
    socket.value.emit('call:request', { toUserId });
  };

  const callAccept = (requestId: string, fromUserId: number) => {
    if (!socket.value) return;
    socket.value.emit('call:accept', { requestId, fromUserId });
    incomingCall.value = null;
  };

  const callReject = (requestId: string, fromUserId: number) => {
    if (!socket.value) return;
    socket.value.emit('call:reject', { requestId, fromUserId });
    incomingCall.value = null;
  };

  const hangup = (roomId: string, peerId: number) => {
    if (!socket.value) return;
    socket.value.emit('call:hangup', { roomId, peerId });
    peerHungUp.value = false;
  };

  const toggleMatchable = (enabled: boolean) => {
    matchable.value = enabled;
    localStorage.setItem('video_matchable', String(enabled));
    if (socket.value) {
      socket.value.emit('match:toggle', { enabled });
    }
  };

  const acceptInvite = () => {
    if (!socket.value || !matchInvite.value) return;
    const { roomId, fromUserId, preference } = matchInvite.value;
    socket.value.emit('match:inviteAccept', { roomId, fromUserId, preference });
    matchInvite.value = null;
  };

  const rejectInvite = () => {
    if (!socket.value || !matchInvite.value) return;
    const { roomId, fromUserId } = matchInvite.value;
    socket.value.emit('match:inviteReject', { roomId, fromUserId });
    matchInvite.value = null;
  };

  const resetMatch = () => {
    matchResult.value = null;
    isMatching.value = false;
    isInviting.value = false;
    callAccepted.value = null;
    peerHungUp.value = false;
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    onlineUsers,
    isMatching,
    matchResult,
    queueSize,
    incomingCall,
    callAccepted,
    peerHungUp,
    matchable,
    matchInvite,
    isInviting,
    connect,
    disconnect,
    joinMatch,
    leaveMatch,
    toggleMatchable,
    acceptInvite,
    rejectInvite,
    callRequest,
    callAccept,
    callReject,
    hangup,
    resetMatch,
  };
}
