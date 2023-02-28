const deleteProduct = async (btn, link) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article');

    try {
        const result = await fetch(`${link}${prodId}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf
            }
        });

        const data = await result.json();
        productElement.parentNode.removeChild(productElement);

        console.log(data);

    } catch (e) {
        console.log(e);
    }
};