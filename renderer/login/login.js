(() => {
  document.getElementById('btn-min').addEventListener('click', () => window.kriptodok.minimize());
  document.getElementById('btn-close').addEventListener('click', () => window.kriptodok.close());

  window.kriptodok.getSavedEmail().then((email) => {
    if (email) document.getElementById('email').value = email;
  });

  const form = document.getElementById('login-form');
  const btn = document.getElementById('btn-login');
  const btnLabel = btn.querySelector('.btn-label');
  const btnSpinner = btn.querySelector('.btn-spinner');
  const errorMsg = document.getElementById('error-msg');

  function setLoading(loading) {
    btn.disabled = loading;
    btnLabel.textContent = loading ? 'Вход…' : 'Войти';
    btnSpinner.hidden = !loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    setLoading(true);
    const result = await window.kriptodok.login({ email, password, remember });
    // On success, main process swaps the window content to the shell —
    // no need to do anything further here. On failure, show the error.
    if (!result.ok) {
      setLoading(false);
      errorMsg.textContent = result.error || 'Не удалось войти. Попробуйте ещё раз.';
    }
  });

  // ---------- Switching between login and registration ----------
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.hidden = true;
    registerForm.hidden = false;
  });
  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.hidden = true;
    loginForm.hidden = false;
  });

  // ---------- Registration ----------
  // ОГРН (13 цифр) и ОГРНИП (15 цифр): последняя цифра — остаток от деления
  // предыдущих цифр на 11 (для ОГРН) или на 13 (для ОГРНИП).
  function isValidOgrn(ogrn) {
    if (!/^\d{13}$|^\d{15}$/.test(ogrn)) return false;
    const body = ogrn.slice(0, -1);
    const div = ogrn.length === 13 ? 11 : 13;
    return Number(body) % div % 10 === Number(ogrn.slice(-1));
  }

  // Проверка ИНН по контрольной сумме (10 цифр — организация, 12 — ИП/физлицо).
  function isValidInn(inn) {
    if (!/^\d{10}$|^\d{12}$/.test(inn)) return false;
    const d = inn.split('').map(Number);
    const check = (coef) => (coef.reduce((s, c, i) => s + c * d[i], 0) % 11) % 10;
    if (inn.length === 10) return check([2, 4, 10, 3, 5, 9, 4, 6, 8]) === d[9];
    return check([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === d[10] &&
           check([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === d[11];
  }

  const regBtn = document.getElementById('btn-register');
  const regBtnLabel = regBtn.querySelector('.btn-label');
  const regBtnSpinner = regBtn.querySelector('.btn-spinner');
  const regError = document.getElementById('register-error');

  function setRegLoading(loading) {
    regBtn.disabled = loading;
    regBtnLabel.textContent = loading ? 'Регистрация…' : 'Зарегистрироваться';
    regBtnSpinner.hidden = !loading;
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    regError.textContent = '';

    const payload = {
      company: document.getElementById('reg-company').value.trim(),
      inn: document.getElementById('reg-inn').value.replace(/\s+/g, ''),
      ogrn: document.getElementById('reg-ogrn').value.replace(/\s+/g, ''),
      phone: document.getElementById('reg-phone').value.trim(),
      lastName: document.getElementById('reg-lastname').value.trim(),
      firstName: document.getElementById('reg-firstname').value.trim(),
      position: document.getElementById('reg-position').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      username: document.getElementById('reg-username').value.trim(),
      password: document.getElementById('reg-password').value,
      passwordConfirm: document.getElementById('reg-password-confirm').value,
    };

    registerForm.querySelectorAll('input').forEach((el) => el.classList.remove('is-invalid'));
    const fail = (id, msg) => {
      document.getElementById(id).classList.add('is-invalid');
      regError.textContent = msg;
    };

    const required = [
      ['reg-company', payload.company, 'Укажите название компании'],
      ['reg-inn', payload.inn, 'Укажите ИНН'],
      ['reg-ogrn', payload.ogrn, 'Укажите ОГРН (для ИП — ОГРНИП)'],
      ['reg-phone', payload.phone, 'Укажите телефон'],
      ['reg-lastname', payload.lastName, 'Укажите фамилию'],
      ['reg-firstname', payload.firstName, 'Укажите имя'],
      ['reg-position', payload.position, 'Укажите должность'],
      ['reg-email', payload.email, 'Укажите email'],
      ['reg-username', payload.username, 'Укажите логин'],
      ['reg-password', payload.password, 'Укажите пароль'],
    ];
    for (const [id, value, msg] of required) {
      if (!value) return fail(id, msg);
    }
    if (!isValidInn(payload.inn)) return fail('reg-inn', 'ИНН указан неверно — проверьте цифры (10 для организации, 12 для ИП)');
    if (!isValidOgrn(payload.ogrn)) return fail('reg-ogrn', 'ОГРН указан неверно — проверьте цифры (13 для организации, 15 для ИП)');
    if (payload.phone.replace(/\D/g, '').length < 10) return fail('reg-phone', 'Телефон указан неверно');
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) return fail('reg-email', 'Email указан неверно');
    if (payload.password.length < 6) return fail('reg-password', 'Пароль должен быть не короче 6 символов');
    if (payload.password !== payload.passwordConfirm) return fail('reg-password-confirm', 'Пароли не совпадают');

    setRegLoading(true);
    const result = await window.kriptodok.register(payload);
    // On success, main process swaps the window content to the shell, same as login.
    if (!result.ok) {
      setRegLoading(false);
      regError.textContent = result.error || 'Не удалось зарегистрироваться. Попробуйте ещё раз.';
    }
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
