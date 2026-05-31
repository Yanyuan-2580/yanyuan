<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  const token = uni.getStorageSync('accessToken');
  if (token) {
    // Auto-login check
  }
});
</script>

<style>
page {
  background-color: #F8FAFC;
  font-family: -apple-system, system-ui, sans-serif;
}
</style>
