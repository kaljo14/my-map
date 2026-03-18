<template>
  <div class="popup-content enhanced">
    <!-- Photo Header -->
    <div v-if="shop.photo_url" class="popup-photo">
      <img :src="shop.photo_url" :alt="shop.name" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
    </div>
    
    <!-- Title and Rating with Edit Button -->
    <div class="popup-header">
      <div class="popup-header-content">
        <h3 class="popup-title">{{ shop.name }}</h3>
        <div class="popup-rating">
          <span class="stars">{{ getStars(shop.rating || 0) }}</span>
          <span class="rating-value">{{ shop.rating || 'N/A' }}</span>
          <span class="rating-count" v-if="shop.user_ratings_total">({{ shop.user_ratings_total }} {{ $t('map.popup.reviews') }})</span>
        </div>
      </div>
      <div class="edit-menu-container" v-if="isAuthenticated">
        <button @click="toggleEditMenu(shop.place_id)" class="edit-btn" :title="$t('map.popup.edit')">
          ⚙️
        </button>
        <div v-if="activeEditMenu === shop.place_id" class="edit-dropdown">
          <button @click="$emit('edit', shop)" class="dropdown-item">
            ✏️ {{ $t('map.popup.editInfo') }}
          </button>
          <button @click="$emit('delete', shop)" class="dropdown-item delete">
            🗑️ {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Badge -->
    <div v-if="shop.is_open_now !== null" class="status-badge" :class="{ open: shop.is_open_now }">
      {{ shop.is_open_now ? `🟢 ${$t('map.popup.openNow')}` : `🔴 ${$t('map.popup.closed')}` }}
    </div>

    <!-- Info Grid -->
    <div class="popup-info">
      <div class="info-row" v-if="shop.price_level">
        <strong>💰 {{ $t('map.popup.price') }}:</strong> {{ '€'.repeat(shop.price_level) }}
      </div>
      <div class="info-row" v-if="shop.address">
        <strong>📍 {{ $t('map.popup.address') }}:</strong> {{ shop.address }}
      </div>
      <div class="info-row" v-if="shop.formatted_phone_number">
        <strong>📞 {{ $t('map.popup.phone') }}:</strong> 
        <a :href="`tel:${shop.formatted_phone_number}`">{{ shop.formatted_phone_number }}</a>
      </div>
      <div class="info-row" v-if="shop.opening_hours_text">
        <strong>🕒 {{ $t('map.popup.hours') }}:</strong>
        <div class="hours-list">
          <div v-for="(line, idx) in shop.opening_hours_text.split('\n').slice(0, 3)" :key="idx" class="hours-line">
            {{ line }}
          </div>
          <div v-if="shop.opening_hours_text.split('\n').length > 3" class="hours-more">
            +{{ shop.opening_hours_text.split('\n').length - 3 }} {{ $t('map.popup.moreDays') }}
          </div>
        </div>
      </div>
      <div class="info-row" v-if="shop.services && shop.services.length > 0">
        <strong>🏷️ {{ $t('map.popup.services') }}:</strong> {{ shop.services.slice(0, 3).join(', ') }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="popup-actions">
      <a v-if="shop.website" :href="shop.website" target="_blank" class="action-btn">
        🌐 {{ $t('map.popup.website') }}
      </a>
      <a v-if="shop.google_maps_url" :href="shop.google_maps_url" target="_blank" class="action-btn">
        🗺️ {{ $t('map.popup.directions') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Place } from '@/api/places';

defineProps<{
  shop: Place;
  isAuthenticated: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', shop: Place): void;
  (e: 'delete', shop: Place): void;
}>();

const activeEditMenu = ref<string | null>(null);

const toggleEditMenu = (placeId: string) => {
  activeEditMenu.value = activeEditMenu.value === placeId ? null : placeId;
};

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
};
</script>

<style scoped>
.popup-content {
  min-width: 250px;
  max-width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-photo {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  margin: -14px -20px 12px -20px;
  position: relative;
}

.popup-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5ddd0;
}

.popup-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #131314;
}

.popup-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #d97757;
  font-size: 1rem;
}

.rating-value {
  font-weight: 700;
  color: #4a4030;
}

.rating-count {
  color: #9d9080;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: rgba(192, 94, 58, 0.1);
  color: #c05e3a;
}

.status-badge.open {
  background: rgba(45, 125, 82, 0.1);
  color: #2d7d52;
}

.popup-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  font-size: 0.9rem;
  color: #4a4030;
  line-height: 1.4;
}

.info-row strong {
  color: #131314;
  font-weight: 600;
}

.info-row a {
  color: #d97757;
  text-decoration: none;
}

.info-row a:hover {
  color: #c05e3a;
  text-decoration: underline;
}

.hours-list {
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid #e5ddd0;
}

.hours-line {
  font-size: 0.85rem;
  color: #6b6057;
}

.hours-more {
  font-size: 0.8rem;
  color: #9d9080;
  font-style: italic;
  margin-top: 2px;
}

.popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: #ede7dc;
  border: 1px solid #e0d8cc;
  border-radius: 6px;
  color: #4a4030;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5ddd0;
  color: #131314;
}

/* Edit Menu Styles */
.edit-menu-container {
  position: relative;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.edit-btn:hover { background: #ede7dc; }

.edit-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #f5f0e8;
  border: 1px solid #e0d8cc;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(19, 19, 20, 0.12);
  padding: 6px;
  z-index: 1000;
  min-width: 160px;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a4030;
  transition: background 0.2s;
}

.dropdown-item:hover { background: #ede7dc; }

.dropdown-item.delete { color: #c05e3a; }
.dropdown-item.delete:hover { background: rgba(192, 94, 58, 0.1); }
</style>
