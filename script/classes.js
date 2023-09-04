const REMOVE_SYMBOL = '\u00D7';
const EMPTY = '';

const docShuffledLists = document.querySelector('.shuffled_lists');

function createDemoData() {
    const i1 = new ShuffledListItem()
    i1.name = "Mike"
    i1.isExecuted = true
    i1.executedDate = "2023-09-01"

    const i2 = new ShuffledListItem()
    i2.name = "Diana"
    i2.isExecuted = false
    i2.executedDate = ""

    const i3 = new ShuffledListItem()
    i3.name = "Kesha"
    i3.isExecuted = true
    i3.executedDate = "2022-09-01"

    const i4 = new ShuffledListItem()
    i4.name = "Sosiska"
    i4.isExecuted = false
    i4.executedDate = ""

    const list12 = new ShuffledList()
    list12.add(i1)
    list12.add(i2)

    const list34 = new ShuffledList()
    list34.add(i3)
    list34.add(i4)

    const lists = new ShuffledLists()
    lists.add(list12)
    lists.add(list34)

    return lists;
}

class ShuffledLists {
    static fromJson(json) {
        let res = new ShuffledLists()
        res.isReadOnly = json.isReadOnly
        json.vShuffledLists.forEach(vShuffledList => res.add(ShuffledList.fromJson(vShuffledList)))
        return res
    }

    constructor(args) {
        this.isReadOnly = true;
        this.vShuffledLists = new Array();
    }

    add(shuffledList = ShuffledList()) {
        this.vShuffledLists.push(shuffledList)
    }

    draw() {
        let root = docShuffledLists

        // Clear
        Array.from(root.childNodes).forEach(index => root.removeChild(index))

        let vsl = this.vShuffledLists
        this.vShuffledLists.forEach((shuffledList, index) => {
            root.appendChild(shuffledList.draw(
                this.isReadOnly,
                function deleteCallback() { vsl.splice(index, 1) }
            ))
        })

        if (!this.isReadOnly) {
            root.appendChild(ShuffledList.drawAddNew(() => this.add(new ShuffledList())))
        }
    }
}

class ShuffledList {
    static fromJson(json) {
        let res = new ShuffledList()
        json.shuffledEntityList.forEach(shuffledEntity => res.add(ShuffledListItem.fromJson(shuffledEntity)))
        return res
    }

    constructor() {
        this.shuffledEntityList = new Array();
    }

    add(shuffledListItem = ShuffledListItem()) {
        this.shuffledEntityList.push(shuffledListItem)
    }

    static drawAddNew(addCallback) {
        let root = document.createElement("div")
        root.className = "shuffled_list"

        let div = document.createElement("div")
        div.className = "content__buttons"

        let button = document.createElement("button")
        button.className = "add"

        let img = document.createElement("img")
        img.className = "add__icon"
        img.src = "image/plus.svg"

        button.appendChild(img)
        div.appendChild(button)
        root.appendChild(div)

        button.addEventListener('click', event => {
            event.preventDefault()
            addCallback()
            saveToStorage()
        })

        return root
    }

    draw(isReadOnly, deleteCallback) {
        let root = document.createElement("div")
        root.className = "shuffled_list"

        let ul = document.createElement("ul")
        ul.className = "participants_list"

        // Append Remove button
        if (!isReadOnly) {
            root.appendChild(this.createRemoveButton(deleteCallback))
        }

        // Append Shuffle button
        root.appendChild(this.createShuffleButton(isReadOnly))

        // Append new participant block
        if (!isReadOnly) {
            root.appendChild(this.createAddParticipantBlock())
        }

        // Append participants
        const sel = this.shuffledEntityList
        this.shuffledEntityList.forEach((shuffledEntity, index) => {
            ul.appendChild(shuffledEntity.draw(
                isReadOnly,
                function deleteCallback() {sel.splice(index, 1)}
            ))
        })

        root.appendChild(ul)

        return root
    }

    createRemoveButton(deleteCallback) {
        const removeButton = document.createElement('div')
        removeButton.className = 'item__remove'
        removeButton.textContent = REMOVE_SYMBOL
        removeButton.addEventListener('click', () => {
            deleteCallback()
            saveToStorage()
        })
        return removeButton
    }

    createShuffleButton(isReadOnly) {
        let div = document.createElement("div")
        div.className = "content__buttons"

        let button = document.createElement("button");
        button.className = "shuffle";

        let textSpan = document.createElement("span");
        textSpan.className = "shuffle__text";
        textSpan.textContent = "SHUFFLE";

        let imgSpan = document.createElement("span");
        imgSpan.className = "shuffle__img";

        let img = document.createElement("img");
        img.className = "shuffle__icon";
        img.src = "image/shuffle.svg";

        imgSpan.appendChild(img)
        button.appendChild(textSpan)
        button.appendChild(imgSpan)
        div.appendChild(button)

        button.addEventListener('click', event => {
            event.preventDefault()
            if (this.shuffledEntityList.length > 0) {
                this.shuffledEntityList.sort(() => Math.random() - 0.5)
            }

            // Drop executionHistory
            this.shuffledEntityList.forEach((shuffledEntity) => {
                shuffledEntity.updateExecuted(false)
            })

            saveToStorage();
        })

        return div
    }

    createAddParticipantBlock() {
        let form = document.createElement("form")
        form.className = "content__form"

        let input = document.createElement("input")
        input.className = "input"

        let button = document.createElement("button")
        button.className = "add"

        let img = document.createElement("img")
        img.className = "add__icon"
        img.src = "image/plus.svg"

        button.appendChild(img)
        form.appendChild(input)
        form.appendChild(button)

        button.addEventListener('click', event => {
            event.preventDefault()

            let inputValue = input.value.trim()
            if (inputValue !== EMPTY) {
                let item = new ShuffledListItem()
                item.name = inputValue
                this.add(item)

                saveToStorage()
            }
        })

        return form
    }
}

class ShuffledListItem {
    static fromJson(json) {
        return Object.assign(new ShuffledListItem(), json)
    }

    name

    constructor() {
        this.isExecuted = false
        this.executedDate = ""
    }

    updateExecuted(newIsExecuted) {
        if (newIsExecuted === this.isExecuted) {
            return
        }
        this.isExecuted = newIsExecuted
        if (this.isExecuted) {
            this.executedDate = new Date().toJSON().slice(0, 10)
        } else {
            this.executedDate = ""
        }
    }

    draw(isReadOnly, deleteCallback) {
        const root = document.createElement('li')
        root.className = 'list__item'

        const elExecutedDate = document.createElement('span')
        elExecutedDate.className = 'item__executed_date'
        elExecutedDate.textContent = this.executedDate

        const elItemName = document.createElement('span')
        elItemName.className = 'item__name'
        elItemName.textContent = this.name

        root.appendChild(this.createExecutedCheckBox())
        root.appendChild(elExecutedDate)
        root.appendChild(elItemName)
        if (!isReadOnly) {
            root.appendChild(this.createRemoveButton(deleteCallback))
        }

        return root
    }

    createExecutedCheckBox() {
        const checkbox = document.createElement('input')
        checkbox.setAttribute("type", "checkbox")
        checkbox.className = 'item__checkbox'
        checkbox.checked = this.isExecuted
        checkbox.addEventListener('click', () => {
            this.updateExecuted(!this.isExecuted)
            saveToStorage()
        })
        return checkbox
    }

    createRemoveButton(deleteCallback) {
        const removeButton = document.createElement('span')
        removeButton.className = 'item__remove'
        removeButton.textContent = REMOVE_SYMBOL
        removeButton.addEventListener('click', () => {
            deleteCallback()
            saveToStorage()
        })
        return removeButton
    }
}
