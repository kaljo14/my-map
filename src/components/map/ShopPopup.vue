<template>
  <div class="popup-content enhanced">
    <!-- Title and Rating with Edit Button -->
    <div class="popup-header">
      <div class="popup-header-content">
        <h3 class="popup-title">{{ shop.name }}</h3>
        <div class="popup-rating">
          <div class="stars">
            <span v-for="i in getStarData(shop.rating || 0).full" :key="`f${i}`" class="material-symbols-outlined star-icon">star</span>
            <span v-if="getStarData(shop.rating || 0).half" class="material-symbols-outlined star-icon">star_half</span>
            <span v-for="i in getStarData(shop.rating || 0).empty" :key="`e${i}`" class="material-symbols-outlined star-icon">star_border</span>
          </div>
          <span class="rating-value">{{ shop.rating || 'N/A' }}</span>
          <span class="rating-count" v-if="shop.user_ratings_total">({{ shop.user_ratings_total }} {{ $t('map.popup.reviews') }})</span>
        </div>
      </div>
      <div class="edit-menu-container" v-if="isAuthenticated">
        <button @click="toggleEditMenu(shop.place_id)" class="edit-btn" :title="$t('map.popup.edit')">
          <span class="material-symbols-outlined">settings</span>
        </button>
        <div v-if="activeEditMenu === shop.place_id" class="edit-dropdown">
          <button @click="$emit('edit', shop)" class="dropdown-item">
            <span class="material-symbols-outlined">edit</span> {{ $t('map.popup.editInfo') }}
          </button>
          <button @click="$emit('delete', shop)" class="dropdown-item delete">
            <span class="material-symbols-outlined">delete</span> {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Badge -->
    <div v-if="shop.is_open_now !== null" class="status-badge" :class="{ open: shop.is_open_now }">
      <span class="material-symbols-outlined status-dot">circle</span>
      {{ shop.is_open_now ? $t('map.popup.openNow') : $t('map.popup.closed') }}
    </div>

    <!-- Info Grid -->
    <div class="popup-info">
      <InfoRow v-if="shop.price_level" icon="payments" :label="`${$t('map.popup.price')}:`">
        {{ '€'.repeat(shop.price_level) }}
      </InfoRow>
      <InfoRow v-if="shop.address" icon="location_on" :label="`${$t('map.popup.address')}:`">
        {{ shop.address }}
      </InfoRow>
      <InfoRow v-if="shop.formatted_phone_number" icon="phone" :label="`${$t('map.popup.phone')}:`">
        <a :href="`tel:${shop.formatted_phone_number}`">{{ shop.formatted_phone_number }}</a>
      </InfoRow>
      <InfoRow v-if="shop.opening_hours_text" icon="schedule" :label="`${$t('map.popup.hours')}:`">
        <div class="hours-list">
          <div v-for="(line, idx) in shop.opening_hours_text.split('\n').slice(0, 3)" :key="idx" class="hours-line">
            {{ line }}
          </div>
          <div v-if="shop.opening_hours_text.split('\n').length > 3" class="hours-more">
            +{{ shop.opening_hours_text.split('\n').length - 3 }} {{ $t('map.popup.moreDays') }}
          </div>
        </div>
      </InfoRow>
      <InfoRow v-if="shop.services?.length" icon="label" :label="`${$t('map.popup.services')}:`">
        {{ shop.services.slice(0, 3).join(', ') }}
      </InfoRow>
      <InfoRow v-if="shop.estimated_monthly_visitors" icon="group" :label="`${$t('map.popup.estimatedVisitors')}:`">
        <span class="visitor-estimate">{{ shop.estimated_monthly_visitors.toLocaleString() }}</span>
      </InfoRow>
    </div>

    <!-- Action Buttons -->
    <div class="popup-actions">
      <a v-if="shop.website" :href="shop.website" target="_blank" class="action-btn">
        <span class="material-symbols-outlined">language</span> {{ $t('map.popup.website') }}
      </a>
      <a v-if="shop.google_maps_url" :href="shop.google_maps_url" target="_blank" class="action-btn">
        <span class="material-symbols-outlined">directions</span> {{ $t('map.popup.directions') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Place } from '@/api/places';
import InfoRow from '@/components/ui/InfoRow.vue';

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

const getStarData = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};
</script>

<style scoped>
.popup-content {
  min-width: 250px;
  max-width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  display: flex;
  align-items: center;
}

.star-icon {
  color: #d97757;
  font-size: 16px;
  line-height: 1;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: rgba(192, 94, 58, 0.1);
  color: #c05e3a;
}

.status-dot {
  font-size: 10px;
  line-height: 1;
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

.visitor-estimate {
  font-weight: 700;
  color: #2d7d52;
}

.popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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

.action-btn .material-symbols-outlined {
  font-size: 16px;
  line-height: 1;
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
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  color: #4a4030;
}

.edit-btn .material-symbols-outlined {
  font-size: 20px;
  line-height: 1;
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.dropdown-item .material-symbols-outlined {
  font-size: 18px;
  line-height: 1;
}

.dropdown-item:hover { background: #ede7dc; }

.dropdown-item.delete { color: #c05e3a; }
.dropdown-item.delete:hover { background: rgba(192, 94, 58, 0.1); }
</style>
