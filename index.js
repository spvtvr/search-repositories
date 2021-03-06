class View {
  constructor() {
    this.input = document.querySelector(".search-input");
    this.resultList = document.querySelector(".result-list");
    this.searchComBox = document.querySelector(".search-complete-box");
    this.searchItem = document.querySelector(".search-item");
  }

  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag, elementClass);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }

  createRepo(repoData) {
    const repoElement = this.createElement("li", "search-item");
    repoElement.textContent = repoData.name;
    this.searchComBox.classList.remove("search-complete-box-off");
    this.searchComBox.append(repoElement);
  }
}

class Search {
  constructor(view) {
    this.view = view;
    this.resultRepos = [];

    this.view.input.addEventListener(
      "keyup",
      this.debounce(this.searchRepos.bind(this), 500)
    );

    this.view.searchComBox.addEventListener("click", e => {
      let target = e.target.textContent;
      let [foundRepo] = this.resultRepos.filter((el) => el.name === target);
      const repoListElem = document.createElement("li");
      repoListElem.classList.add("result-item");
      repoListElem.innerHTML = `<div class="result-text">
                                    <p>Name: ${foundRepo.name}</p>
                                    <p>Owner: ${foundRepo.owner.login}</p>
                                    <p>Stars: ${foundRepo.stargazers_count}</p>
                                </div>
                                 <button type="button" class="result-delete"></button>`;
      this.view.resultList.append(repoListElem);
      this.clearList();
      this.view.input.value = '';
    });

    this.view.resultList.addEventListener('click', e => {
        if (e.target.className != 'result-delete') return;
        let elem = e.target.closest('li');
        elem.remove();
    })
  }

  async searchRepos() {
    this.resultRepos = [];
    this.clearList();
    const searchValue = this.view.input.value;
    if (searchValue) {
      return await fetch(
        `https://api.github.com/search/repositories?q=${searchValue}&per_page=5`
      ).then((res) => {
        if (res.ok) {
          res.json().then((res) => {
            res.items.forEach((item) => this.view.createRepo(item));
            this.resultRepos = res.items;
          });
        }
      });
    } else {
      this.clearList();
    }
  }

  clearList() {
    this.view.searchComBox.innerHTML = "";
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}

new Search(new View());
