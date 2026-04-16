
function modalShow(id) {
	toggleModalById(id, 'open');
}
function modalHide(id) {
	toggleModalById(id, 'hide');
}

function showToast_Success2(title, content = '', icon = 'flaticon-success', dur = 2000) {
    dur = 5000;
    toast.show(title, content, 'success', dur);
}
function showToast_Error2(title, content = '', icon = 'flaticon-error', dur = 2000) {
    dur = 5000;
    toast.show(title, content, 'danger', dur);
}