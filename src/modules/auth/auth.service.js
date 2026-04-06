/**
 * Placeholder — add JWT/sessions and user lookup when authentication is implemented.
 */
async function login(credentials) {
  return {
    token: null,
    note: 'MVP placeholder — implement auth (e.g. JWT) here',
    receivedKeys: credentials && typeof credentials === 'object' ? Object.keys(credentials) : [],
  };
}

async function logout(_sessionHint) {
  return {
    loggedOut: true,
    note: 'MVP placeholder — invalidate session/token here',
  };
}

module.exports = {
  login,
  logout,
};
