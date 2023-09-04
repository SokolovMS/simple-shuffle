const STATUS_SHUFFLE_KEY = 'status_shuffle';

const editButton = document.querySelector('.edit');


let shuffledLists

window.onload = function () {
    shuffledLists = localStorage.getShuffledLists()

    if (shuffledLists) {
        shuffledLists.draw();
    }
};

function saveToStorage() {
    localStorage.setObj(shuffledLists);
    shuffledLists.draw();
}

Storage.prototype.setObj = function (obj) {
    return this.setItem(STATUS_SHUFFLE_KEY, JSON.stringify(obj));
}

Storage.prototype.getObj = function () {
    return JSON.parse(this.getItem(STATUS_SHUFFLE_KEY));
}

Storage.prototype.getShuffledLists = function () {
    try {
        return ShuffledLists.fromJson(localStorage.getObj())
    } catch (e) {
        alert (e)
        return createDemoData()
    }
}

editButton.addEventListener('click', event => {
    event.preventDefault()
    shuffledLists.isReadOnly = !shuffledLists.isReadOnly
    saveToStorage()
})

