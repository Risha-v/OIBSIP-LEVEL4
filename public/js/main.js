document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form[action="/login"]');
    const registerForm = document.querySelector('form[action="/register"]');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        validateForm(loginForm, true);
      });
    }
  
    if (registerForm) {
      registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        validateForm(registerForm, false);
      });
    }
  
    function validateForm(form, isLogin) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
  
      if (isLogin) {
        const { username, password } = data;
  
        if (!username || !password) {
          alert('Please enter both username and password.');
          return;
        }
  
        submitForm(form, data);
      } else {
        const { name, username, password, email, mobile } = data;
  
        if (!name || !username || !password || !email || !mobile) {
          alert('Please fill in all fields.');
          return;
        }
  
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }
  
        if (!/^\d{10}$/.test(mobile)) {
          alert('Please enter a valid 10-digit mobile number.');
          return;
        }
  
        submitForm(form, data);
      }
    }
  
    function submitForm(form, data) {
      fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          window.location.href = response.redirected ? response.url : '/';
        } else {
          return response.text().then(text => {
            throw new Error(text);
          });
        }
      })
      .catch(error => {
        alert(error.message);
      });
    }
  });