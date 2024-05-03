const addNewTodoButtonEventListener = () => {
    // TODO modify to specific value name
    const txt_pant = document.getElementById("txt_in").value
    openSyncPlantsIDB().then((db) => {
        addNewPlantToSync(db, txt_pant);
    });
    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Todo App",
                {body: "Todo added! - " + txt_pant})
                .then(r =>
                    console.log(r)
                );
        });
}

window.onload = function () {
    // TODO modify to specific button name
    const add_btn = document.getElementById("add_btn")
    add_btn.addEventListener("click", addNewTodoButtonEventListener)
}