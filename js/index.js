new Vue({
  el: '#app',
  data: {
    auth: {
      email: '',
      password: '',
    },
  },
  methods: {
    login() {
      const vm = this;
      const api = 'https://course-ec-api.hexschool.io/api/auth/login';
      if (vm.auth.email === '' || vm.auth.password === '') {
        alert('請輸入正確資訊');
      } else {
        axios.post(api, vm.auth).then((res) => {
          console.log(res);
          // 把 token 存到 cookie，儲存 1 個小時
          // document.cookie = `token=${res.data.token};max-age=${60*60}`;
          document.cookie = `token=${res.data.token};expires=${new Date(res.data.expired * 1000)}; path=/`;
          window.location = 'dashboard.html';
        }).catch((err) => {
          console.log('登入失敗', err);
        })
      }
    },
  },
});