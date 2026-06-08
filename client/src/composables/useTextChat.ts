import { ref } from 'vue';
import type { Socket } from 'socket.io-client';

export interface TextMessage {
  content: string;
  from: 'me' | 'peer' | 'system';
  timestamp: number;
}

export function useTextChat() {
  const messages = ref<TextMessage[]>([]);
  const isPeerTyping = ref(false);
  const upgradeRequested = ref(false);
  const upgradeRejected = ref(false);
  const peerLeft = ref(false);

  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  let socketRef: Socket | null = null;
  let currentRoomId = '';

  const bindSocket = (socket: Socket, roomId: string) => {
    socketRef = socket;
    currentRoomId = roomId;
    messages.value = [];

    socket.on('text:message', (data: { content: string; timestamp: number; from: string }) => {
      messages.value.push({
        content: data.content,
        from: data.from as 'peer' | 'system',
        timestamp: data.timestamp,
      });
      isPeerTyping.value = false;
    });

    socket.on('text:typing', () => {
      isPeerTyping.value = true;
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(() => { isPeerTyping.value = false; }, 3000);
    });

    socket.on('text:peerLeft', () => {
      peerLeft.value = true;
      messages.value.push({
        content: '对方已离开聊天',
        from: 'system',
        timestamp: Date.now(),
      });
    });

    socket.on('text:upgradeRequest', () => {
      upgradeRequested.value = true;
      messages.value.push({
        content: '📹 对方请求视频聊天',
        from: 'system',
        timestamp: Date.now(),
      });
    });

    socket.on('text:upgradeRejected', () => {
      upgradeRejected.value = true;
      messages.value.push({
        content: '对方暂时不方便视频聊天',
        from: 'system',
        timestamp: Date.now(),
      });
    });
  };

  const sendMessage = (content: string) => {
    if (!socketRef || !content.trim()) return;
    messages.value.push({
      content: content.trim(),
      from: 'me',
      timestamp: Date.now(),
    });
    socketRef.emit('text:message', { roomId: currentRoomId, content: content.trim() });
  };

  const sendTyping = () => {
    if (!socketRef) return;
    socketRef.emit('text:typing', { roomId: currentRoomId });
  };

  const requestUpgrade = () => {
    if (!socketRef) return;
    socketRef.emit('text:upgrade', { roomId: currentRoomId });
    messages.value.push({
      content: '📹 你请求了视频聊天...',
      from: 'system',
      timestamp: Date.now(),
    });
  };

  const acceptUpgrade = () => {
    if (!socketRef) return;
    socketRef.emit('text:upgradeAccept', { roomId: currentRoomId });
    upgradeRequested.value = false;
  };

  const rejectUpgrade = () => {
    if (!socketRef) return;
    socketRef.emit('text:upgradeReject', { roomId: currentRoomId });
    upgradeRequested.value = false;
  };

  const leaveChat = () => {
    if (!socketRef) return;
    socketRef.emit('text:leave', { roomId: currentRoomId });
    messages.value = [];
    peerLeft.value = false;
    upgradeRequested.value = false;
  };

  const unbind = () => {
    if (socketRef) {
      socketRef.off('text:message');
      socketRef.off('text:typing');
      socketRef.off('text:peerLeft');
      socketRef.off('text:upgradeRequest');
      socketRef.off('text:upgradeRejected');
    }
    socketRef = null;
    currentRoomId = '';
  };

  return {
    messages,
    isPeerTyping,
    upgradeRequested,
    upgradeRejected,
    peerLeft,
    bindSocket,
    sendMessage,
    sendTyping,
    requestUpgrade,
    acceptUpgrade,
    rejectUpgrade,
    leaveChat,
    unbind,
  };
}
