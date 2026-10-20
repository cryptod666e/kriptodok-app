(() => {
  document.getElementById('btn-min').addEventListener('click', () => window.kriptodok.minimize());
  document.getElementById('btn-close').addEventListener('click', () => window.kriptodok.close());

  // Approval isn't announced here — main.js just navigates the whole window to
  // the shell once the poll sees "approved". Rejection, though, has to be shown
  // on THIS screen (nowhere else to show it), so we listen for that push.
  window.kriptodok.onRegistrationStatus(({ status }) => {
    if (status === 'rejected') {
      document.getElementById('pending-status').hidden = true;
      document.getElementById('pending-rejected').hidden = false;
    }
  });

  document.getElementById('btn-back-to-login').addEventListener('click', () => {
    window.kriptodok.backToLogin();
  });

  // ---------- Ping ----------
  const pingDot = document.getElementById('ping-dot');
  const pingValue = document.getElementById('ping-value');
  window.kriptodok.onPingStatus(({ ok, ms }) => {
    if (!ok) {
      pingDot.className = 'ping-dot is-red';
      pingValue.textContent = 'нет связи';
      return;
    }
    const level = ms <= 20 ? 'green' : ms <= 100 ? 'orange' : 'red';
    pingDot.className = `ping-dot is-${level}`;
    pingValue.textContent = `${ms} мс`;
  });
})();
