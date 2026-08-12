// ══════════════════════════════════════════════════════════════════════
// Profile Selection — Marcador de Consumo Alimentar
// ══════════════════════════════════════════════════════════════════════

const PROFILE_STORAGE_KEY = 'marcadores.selectedProfile';

// These UUIDs identify the existing Supabase users and preserve every
// evaluation already associated with each profile.
const MARCADORES_PROFILES = Object.freeze([
  Object.freeze({
    id: 'b4d5b1a2-a7e7-47ad-9f2a-b6b1abede8af',
    name: 'Marcelo'
  }),
  Object.freeze({
    id: 'db66d658-c489-41a0-8f00-0c3831e10742',
    name: 'Mariana Aires'
  })
]);

function findProfile(profileId) {
  return MARCADORES_PROFILES.find(profile => profile.id === profileId) || null;
}

function selectProfile(profileId) {
  const profile = findProfile(profileId);
  if (!profile) return;

  sessionStorage.setItem(PROFILE_STORAGE_KEY, profile.id);
  window.location.href = 'app.html';
}

function getSelectedProfile() {
  const profileId = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  return findProfile(profileId);
}

function requireProfile() {
  const profile = getSelectedProfile();
  if (!profile) {
    window.location.replace('index.html');
    return null;
  }
  return profile;
}

function handleLogout() {
  sessionStorage.removeItem(PROFILE_STORAGE_KEY);
  window.location.href = 'index.html';
}
