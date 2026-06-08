import { ref, onUnmounted } from 'vue';
import TRTC from 'trtc-sdk-v5';

export interface TrtcConfig {
  sdkAppId: number;
  userId: string;
  userSig: string;
  roomId: string;
}

export function useTrtc() {
  const isJoined = ref(false);
  const isMuted = ref(false);
  const isVideoOff = ref(false);
  const remoteUsers = ref<string[]>([]);
  const error = ref('');
  const isConnecting = ref(false);

  let trtcClient: any = null;

  const joinRoom = async (config: TrtcConfig, localVideoId: string) => {
    isConnecting.value = true;
    error.value = '';

    try {
      trtcClient = TRTC.create();

      // Enter TRTC room (字符串房间号用 strRoomId)
      await trtcClient.enterRoom({
        sdkAppId: config.sdkAppId,
        userId: config.userId,
        userSig: config.userSig,
        strRoomId: config.roomId,
        scene: 'rtc',
      });

      // Start local video and audio
      try {
        await trtcClient.startLocalVideo({ view: localVideoId });
      } catch {
        // Camera might be unavailable, continue without video
        isVideoOff.value = true;
      }

      try {
        await trtcClient.startLocalAudio();
      } catch {
        isMuted.value = true;
      }

      // Handle remote user events
      trtcClient.on(TRTC.EVENT.REMOTE_USER_ENTER, ({ userId }: { userId: string }) => {
        if (!remoteUsers.value.includes(userId)) {
          remoteUsers.value.push(userId);
        }
      });

      trtcClient.on(TRTC.EVENT.REMOTE_USER_EXIT, ({ userId }: { userId: string }) => {
        remoteUsers.value = remoteUsers.value.filter((u) => u !== userId);
      });

      trtcClient.on(
        TRTC.EVENT.REMOTE_VIDEO_AVAILABLE,
        ({ userId, streamType }: { userId: string; streamType: string }) => {
          // Auto-play remote video — creates video element with data-user-id attribute
          const viewId = `remote-video-${userId}`;
          let view = document.getElementById(viewId);
          if (!view) {
            view = document.createElement('div');
            view.id = viewId;
            view.setAttribute('data-user-id', userId);
            view.className = 'remote-video-container';
            document.getElementById('remote-videos')?.appendChild(view);
          }
          trtcClient.startRemoteVideo({ userId, streamType, view: viewId });
        },
      );

      trtcClient.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, ({ userId }: { userId: string }) => {
        trtcClient.muteRemoteAudio(userId, false);
      });

      isJoined.value = true;
    } catch (err: any) {
      error.value = err.message || '加入房间失败';
      console.error('TRTC join error:', err);
    } finally {
      isConnecting.value = false;
    }
  };

  const leaveRoom = async () => {
    try {
      if (trtcClient) {
        await trtcClient.stopLocalVideo();
        await trtcClient.stopLocalAudio();
        await trtcClient.exitRoom();
        trtcClient.destroy();
      }
    } catch (err) {
      console.error('TRTC leave error:', err);
    } finally {
      trtcClient = null;
      isJoined.value = false;
      remoteUsers.value = [];
    }
  };

  const toggleMute = async () => {
    if (!trtcClient) return;
    try {
      if (isMuted.value) {
        await trtcClient.startLocalAudio();
      } else {
        await trtcClient.stopLocalAudio();
      }
      isMuted.value = !isMuted.value;
    } catch (err) {
      console.error('Toggle mute error:', err);
    }
  };

  const toggleVideo = async () => {
    if (!trtcClient) return;
    try {
      if (isVideoOff.value) {
        await trtcClient.startLocalVideo({ view: 'local-video' });
      } else {
        await trtcClient.stopLocalVideo();
      }
      isVideoOff.value = !isVideoOff.value;
    } catch (err) {
      console.error('Toggle video error:', err);
    }
  };

  onUnmounted(() => {
    if (isJoined.value) {
      leaveRoom();
    }
  });

  return {
    isJoined,
    isMuted,
    isVideoOff,
    remoteUsers,
    error,
    isConnecting,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
  };
}
