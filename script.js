function validate(event) {
    const inputs = document.getElementsByTagName("input");
    let at_least_one_checked = false;

    for (let i = 0; i < inputs.length; ++i) {
        at_least_one_checked |= inputs[i].type == "checkbox" && inputs[i].checked;
    }

    if (!at_least_one_checked) {
        const hidden_elems = document.getElementsByClassName("hidden");
        
        for (let i = 0; i < hidden_elems.length; ++i) {
            hidden_elems[i].classList.remove("hidden");
        }

        event.preventDefault(); //Stops the onsubmit event. Prevents the form from submitting.
        
    }

    return at_least_one_checked; 
}
