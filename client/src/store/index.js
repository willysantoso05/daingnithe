import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userID: null,
    username: null,
  },

  getters: {
    userID: (state) => {
      return state.userID;
    },
    username: (state) => {
      return state.username;
    }
  },

  mutations: {
    userID(state, userID) {
      state.userID = userID;
    },
    username(state, username) {
      state.username = username;
    }
  },

  actions: {
    userID(context, userID) {
      context.commit('userID', userID);
    },
    username(context, username) {
      context.commit('username', username);
    }
  },

  modules: {
  }
})
