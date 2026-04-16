const preloaderWrapper = document.querySelector('.preloader-wrapper');
const preloaderWrapperBody = document.querySelector('.preloader-wrapper-body');
const loaderWrapper = document.querySelector('.loading-screen-wrapper');
let preloaderLoadTO = null;
window.addEventListener('load', function() {
	___preloaderTOStart();
});
function ___preloaderTOStart() {
	preloaderLoadTO = setTimeout(function() {
		preloaderWrapper.classList.add('fade-out-animation');
		clearTimeout(preloaderLoadTO);
		preloaderLoadTO = null;
	}, 300);
}
function ___loadingScreenEffect(show = true, message = '') {
	try{
		const hidden = "loader-hidden";
		if(loaderWrapper != null && loaderWrapper != 'undefined') {
			try{
				if(show) {
					if(loaderWrapper.classList.contains(hidden)) {
						loaderWrapper.classList.remove(hidden);
					}
				}else{
					if(!loaderWrapper.classList.contains(hidden)) {
						loaderWrapper.classList.add(hidden);
					}
				}
			}catch(err){}
			try{
				if(message != null && message != 'undefined' && message != '') {
					const el_message = loaderWrapper.querySelector('#message');
					if(el_message != null && el_message != 'undefined') {
						el_message.innerHTML = message;
					}
				}
			}catch(err) {  }
		}
	}catch(err) {}
}
function ___checkPreloaderTheme() {

}
function ___setPreloaderThemeLight() {
	if($(preloaderWrapperBody).hasClass('dark')) {
		$(preloaderWrapperBody).removeClass('dark');
	}
}
function ___setPreloaderThemeDark() {
	if(!$(preloaderWrapperBody).hasClass('dark')) {
		$(preloaderWrapperBody).addClass('dark');
	}
}