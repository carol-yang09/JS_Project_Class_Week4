// loading 元件
Vue.component('loading', VueLoading);

// editModal 元件
Vue.component('editModal', {
  template: '#editModal',
  props: ['user'],
  data() {
    return {
      tempProduct: { imageUrl: [] },
    };
  },
  methods: {
    // 取得單一商品
    getProduct(id) {
      const vm = this;
      vm.$emit('change-loading', true);
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/ec/product/${id}`;
      axios.get(apiUrl, {
        headers: {
          authorization: `Bearer ${vm.user.token}`,
        },
      }).then((res) => {
        vm.tempProduct = Object.assign({}, res.data.data);
        vm.$emit('change-loading', false);
      }).catch((err) => {
        console.log('錯誤', err);
        vm.$emit('change-loading', false);
      });
    },
    // 更新/新增 商品
    updateProduct() {
      const vm = this;
      vm.$emit('change-loading', true);
      let apiUrl = '';
      let method = '';
      if (vm.tempProduct.id) {
        apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/ec/product/${vm.tempProduct.id}`;
        method = 'patch';
      } else {
        apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/ec/product`;
        method = 'post';
      }
      axios({
        method,
        url: apiUrl,
        data: vm.tempProduct,
        headers: {
          authorization: `Bearer ${vm.user.token}`,
        },
      }).then(() => {
        vm.tempProduct = { imageUrl: [] };
        vm.$emit('get-products');
        $('#editModal').modal('hide');
      }).catch((err) => {
        console.log('錯誤', err);
        vm.$emit('change-loading', false);
      });
    },
    uploadFile() {
      const vm = this;
      const file = vm.$refs.file.files[0];
      const formData = new FormData();
      formData.append('file', file);
      vm.$emit('change-loading', true);
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/storage`;
      axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${vm.user.token}`,
        },
      }).then((res) => {
        vm.tempProduct.imageUrl.push(res.data.data.path);
        vm.$emit('change-loading', false);
      }).catch((err) => {
        console.log('上傳圖檔不可超過 2MB', err);
        vm.$emit('change-loading', false);
      });
    },
  },
});

// delModal 元件
Vue.component('delModal', {
  template: '#delModal',
  props: ['tempProduct', 'user'],
  methods: {
    // 刪除商品
    delProduct() {
      const vm = this;
      const id = this.tempProduct.id;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/ec/product/${id}`;
      axios.delete(apiUrl, {
        headers: {
          authorization: `Bearer ${vm.user.token}`,
        },
      }).then(() => {
        vm.$emit('get-products');
        $('#delModal').modal('hide');
      }).catch((err) => {
        console.log('錯誤', err);
      });
    },
  },
});

// pagination 元件
Vue.component('pagination', {
  template: '#pagination',
  props: ['pages'],
  methods: {
    changePage(page) {
      this.$emit('get-products', page);
    },
  },
});

new Vue({
  el: '#app',
  data: {
    // loading 效果
    isLoading: false,
    user: {
      token: '',
      uuid: '7e04c7a2-2bef-47b1-8b3a-5ab4c09e67b3',
    },
    pagination: [],
    products: [],
    tempProduct: {
      imageUrl: [],
    },
  },
  methods: {
    // 取得全部商品列表
    getProducts(page = 1) {
      const vm = this;
      vm.isLoading = true;
      const apiUrl = `https://course-ec-api.hexschool.io/api/${vm.user.uuid}/admin/ec/products?page=${page}`;
      axios.get(apiUrl, {
        headers: {
          authorization: `Bearer ${vm.user.token}`,
        },
      }).then((res) => {
        vm.products = Object.assign({}, res.data.data);
        vm.pagination = Object.assign({}, res.data.meta.pagination);
        vm.isLoading = false;
      }).catch((err) => {
        console.log('錯誤', err);
        vm.isLoading = false;
      });
    },
    // 開啟 Modal
    openModal(isNew, item) {
      switch (isNew) {
        case 'new':
          this.tempProduct = {imageUrl: []};
          $('#editModal').modal('show');
          break;
        case 'edit':
          this.$refs.editModal.getProduct(item.id);
          $('#editModal').modal('show');
          break;
        case 'del':
          this.tempProduct = Object.assign({}, item);
          $('#delModal').modal('show');
          break;
      }
    },
    changeLoading(val) {
      this.isLoading = val;
    },
  },
  created() {
    // 取得 cookie 中的 token
    // 參考 MDN https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
    this.user.token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    // 若沒有 token 則轉到 登入頁
    if (this.user.token === '') {
      window.location = 'index.html';
    }
    
    this.getProducts();
  },
});