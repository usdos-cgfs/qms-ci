import { searchSelectTemplate } from "./SearchSelectTemplate.js";

customElements.define(
  "search-select",
  class extends HTMLElement {
    constructor() {
      super();
      const templateText = searchSelectTemplate;

      this.selectableItems = [];

      this.attachShadow({ mode: "open" });

      this.shadowRoot.innerHTML = templateText;

      this.searchGroupElement = this.shadowRoot.getElementById("search-group");
      this.searchInputGroupElement = this.shadowRoot.querySelector(
        ".search-input-group"
      );
      this.searchInputElement = this.shadowRoot.getElementById("search-input");
      this.filteredItemsElement = this.shadowRoot.getElementById(
        "filtered-items-text"
      );

      this.selectedItemsElement = this.shadowRoot.getElementById(
        "selected-items-text"
      );

      this.options = this.querySelectorAll("option");
    }

    initializeFilteredItems = () => {
      this.options = this.querySelectorAll("option");
      this.filteredItemDivs = [...this.options].map((opt, index) => {
        let li = document.createElement("li");
        li.classList.add("filtered", "item");
        li.classList.toggle("even", index % 2);
        //li.type = "button";
        li.innerHTML = opt.innerHTML;
        li.dataset.value = opt.value;
        return li;
      });

      this.filteredItemsElement.replaceChildren(...this.filteredItemDivs);
      this.updateFilteredItems();
      this.updateSelectedItems(true);
    };

    updateFilteredItems = () => {
      // Filter based off the search input
      const searchText = this.searchInputElement.value;
      this.filteredItemDivs.forEach((opt) => {
        const optContainsText =
          opt.innerText.toLowerCase().search(searchText.toLowerCase()) >= 0;

        const shouldBeShown = !searchText || optContainsText;
        opt.classList.toggle("hidden", !shouldBeShown);
      });

      // Filter based off already selected items
      [...this.options]
        .filter((opt) => opt.hasAttribute("selected"))
        .map((opt) => {
          this.filteredItemDivs
            .find((div) => div.dataset.value === opt.value)
            .classList.add("hidden");
        });

      var count = [
        ...this.filteredItemsElement.querySelectorAll("li:not(.hidden)"),
      ].map((li, index) => li.classList.toggle("even", index % 2));

      // Finally, if all items are selected, deactivate dropdown
      //this.filteredItemsElement.classList.toggle("active", count.length);
      //console.log("updated filtered items");
    };

    updateActiveFilteredItem = (keyDirection) => {
      // We have used our arrow keys to navigate to an item
      // Check that all our items are still visible
      const visibleItems = this.filteredItemDivs.find(
        (opt) => !opt.classList.contains("hidden")
      );
      if (!visibleItems) {
        return;
      }

      // find the currently active item
      const activeItemIndex = this.filteredItemDivs.findIndex((opt) =>
        opt.classList.contains("active")
      );

      let index = activeItemIndex + keyDirection;
      let item;

      do {
        if (index >= this.filteredItemDivs.length) {
          index = 0;
        }
        // Iterate through the items until we find the next one that isn't hidden
        item = this.filteredItemDivs.at(index);
        index += keyDirection;
      } while (item.classList.contains("hidden"));

      item.classList.add("active");
      if (activeItemIndex >= 0) {
        this.filteredItemDivs[activeItemIndex].classList.remove("active");
      }
    };

    selectActiveFilteredItem = () => {
      // We have hit enter after navigating to an item in our list
      // find the currently active item
      const activeItem = this.filteredItemDivs.find((opt) =>
        opt.classList.contains("active")
      );

      if (activeItem) {
        this.selectFilteredItem(activeItem);
        this.updateActiveFilteredItem(1);
      }
    };

    updateSelectedItems = (initial = false) => {
      this.selectedOptions = [...this.options].filter((opt) =>
        opt.hasAttribute("selected")
      );

      const closeCopy = this.shadowRoot.getElementById("icon-close").innerHTML;
      // const closeCopy = document.createElement("img");
      // closeCopy.setAttribute("src", "./icon/close.svg");

      const selectedItemDivs = this.selectedOptions.map((opt) => {
        // const itemGroup = document.createElement("div");
        // itemGroup.classList.add("input-group", "input-group-sm");
        // itemGroup.dataset.value = opt.value;

        // let itemText = document.createElement("div");
        // itemText.classList.add("input-group-text");
        // itemText.innerText = opt.innerHTML;

        // const itemClose = document.createElement("button");
        // itemClose.classList.add("btn", "btn-sm", "btn-outline-secondary");
        // itemClose.style.width = "1.5rem";
        // itemClose.innerHTML = closeCopy;

        // itemGroup.appendChild(itemText);
        // // itemGroup.append(itemText, itemClose);
        // itemGroup.appendChild(itemClose);
        // return itemGroup;
        const itemGroup = document.createElement("div");
        itemGroup.classList.add("selected", "item");
        itemGroup.dataset.value = opt.value;

        const itemText = document.createElement("div");
        // itemText.classList.add("input-group-text");
        itemText.innerText = opt.innerHTML;

        // Append our close button
        const close = document.createElement("div");
        close.classList.add("remove");

        //Add our svg close button
        close.innerHTML = closeCopy;

        itemGroup.appendChild(itemText);
        itemGroup.appendChild(close);
        return itemGroup;
      });
      this.selectedItemsElement.replaceChildren(...selectedItemDivs);
      if (!initial) {
        this.dispatchEvent(new Event("change"));
      }
    };

    selectFilteredItem = (item) => {
      // We have clicked or otherwise selected an item.
      [...this.options]
        .find((opt) => opt.value === item.dataset.value)
        .setAttribute("selected", "");
      this.updateSelectedItems();
      this.updateFilteredItems();
    };

    removeSelectedItem = (item) => {
      // We are removing an item from our selected items
      [...this.options]
        .find((opt) => opt.value === item.dataset.value)
        .removeAttribute("selected");
      this.updateSelectedItems();
      this.updateFilteredItems();
    };

    connectedCallback() {
      this.filteredItemsElement.classList.toggle("active", false);
      this.initializeFilteredItems();

      this.searchGroupElement.addEventListener("focusin", (e) => {
        //console.log(this.getAttribute("name") + " Adding active");
        this.filteredItemsElement.classList.toggle("active", true);
        this.searchGroupElement.classList.toggle("active", true);
        clearTimeout(this.focusOutTimeout);
      });

      this.searchGroupElement.addEventListener("focusout", (e) => {
        //console.log(this.getAttribute("name") + " focused out by ", e.target);

        this.focusOutTimeout = setTimeout(() => {
          //console.log(this.getAttribute("name") + " Removing active");
          this.filteredItemsElement.classList.remove("active");
          this.searchGroupElement.classList.remove("active");
        }, 0);
      });

      this.searchInputElement.addEventListener("input", (e) => {
        this.updateFilteredItems();
      });

      this.searchInputElement.addEventListener("focusout", (e) => {
        //console.log(
        //this.getAttribute("name") + " input focused out by ", e.target;
        //);
      });

      this.searchGroupElement.addEventListener("keydown", (e) => {
        // get the key
        switch (e.code) {
          case "Tab":
            // tab
            //this.filteredItemsElement.style.display = "none";
            this.filteredItemsElement.classList.remove("active");
            break;
          case "ArrowDown":
            // down arrow
            this.updateActiveFilteredItem(1);
            break;
          case "ArrowUp":
            // up arrow
            this.updateActiveFilteredItem(-1);
            break;
          case "Enter":
            // Enter
            this.handlingClick = true;
            this.selectActiveFilteredItem();
            break;
          default:
          // console.log(e.keyCode);
        }
      });

      this.filteredItemsElement.addEventListener("click", (e) => {
        // console.log("clicked " + e.target.innerHTML);
        this.selectFilteredItem(e.target);
      });
      this.selectedItemsElement.addEventListener("click", (e) => {
        this.removeSelectedItem(e.target.closest("div.item"));
      });

      // Child node added mutation listener
      const mutationCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.type === "childList") {
            this.initializeFilteredItems();
          }
        }
      };

      this.mutationObserver = new MutationObserver(mutationCallback);
      this.mutationObserver.observe(this, { childList: true });
    }

    disconnectedCallback() {
      try {
        // this.searchGroupElement.removeEventListener();
        // this.filteredItemsElement.removeEventListener();
        // this.searchInputElement.removeEventListener();
        // this.removeEventListener();
        this.mutationObserver.disconnect();
      } catch (e) {
        console.warn("cannot remove event listeners");
      }
    }
  }
);
