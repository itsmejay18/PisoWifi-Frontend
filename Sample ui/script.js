

let isConnected = false;

window.addEventListener('load', (event) => {
	applyTags();
	bind_btns();
});

function applyTags() {
	let tag;
	let val;

	tag = "<{!!STYLE!!}>"; val = ""; replaceTags2(tag, val);
	tag = "<{!!VARS!!}>"; val = ""; replaceTags2(tag, val);
	tag = "<{!!MAC!!}>"; val = "1e:2b:3c:4d:5e"; replaceTags2(tag, val);
	tag = "<{!!IP!!}>"; val = "10.0.0.121"; replaceTags2(tag, val);
	tag = "<{!!BWDL!!}>"; val = "10"; replaceTags2(tag, val);
	tag = "<{!!BWUL!!}>"; val = "10"; replaceTags2(tag, val);
	tag = "<{!!TITLE!!}>"; val = "UniFi"; replaceTags2(tag, val);
	tag = "<{!!MODALS!!}>"; val = ""; replaceTags2(tag, val);
	tag = "<{!!TIMESTAMP!!}>"; val = ""; replaceTags2(tag, val);
	tag = "<{!!STATCONN!!}>"; val = "Disconnected"; replaceTags2(tag, val);

}
function replaceTags(tag, val) {
	const regex = new RegExp(tag, 'g'); 
	document.body.innerHTML = document.body.innerHTML.replace(regex, val);
}
function replaceTags2(tag, val) {
	const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
	let node;
	const regex = new RegExp(tag, 'g');
	while (node = walk.nextNode()) {
	  node.nodeValue = node.nodeValue.replace(regex, val);
	}
}

function bind_btns() {
	const bconnect = document.getElementById('connect');
	bconnect.addEventListener('click', function() {
		if(!isConnected) {
			connect();
		}else{
			disconnect();
		}
	});
	const wifirates = document.getElementById('wifirates');
	wifirates.addEventListener('click', function() {
		showLoading();
		setTimeout(() => {
			modalShow("#mdl__wifirates");
		}, 1000);
	});
	const creditinsert = document.getElementById('creditinsert');
	creditinsert.addEventListener('click', function() {
		showLoading();
		setTimeout(() => {
			modalShow("#mdl__creditinsert");
		}, 1000);
	});
	const voucher = document.getElementById('voucher');
	voucher.addEventListener('click', function() {
		showLoading();
		setTimeout(() => {
			modalShow("#mdl__voucher");
		}, 1000);
	});
}

function connect() {
	isConnected = true;
	showToast_Success2("Connected","Connected.");
	update_ui_conn_status();
}
function disconnect() {
	isConnected = false;
	showToast_Error2("Disconnected","Disconnected.");
	update_ui_conn_status();
}

function update_ui_conn_status() {
	var tel = $('#'+'connect');
    var telstatus = $('#'+'statConnected');
    updateUIBtnConnect(tel, isConnected);
    updateUIStatConnected(telstatus, isConnected);
}

function updateUIBtnConnect(target, connected = true) {
    if(connected) {
        /* CONNECTED */
        if(target != null && target != 'undefined') {
            target.text("Disconnect");
            target.val("Disconnect");
            if (target.hasClass("btn-success")) {
                target.removeClass("btn-success");
                if (!target.hasClass("btn-danger")) {
                    target.addClass("btn-danger");
                }
            }
            if (target.hasClass("btn-connect")) {
                target.removeClass("btn-connect");
                if (!target.hasClass("btn-disconnect")) {
                    target.addClass("btn-disconnect");
                }
            }
            showHideElement(target, connected);
        }
    }else{
        /* DISCONNECTED */
        if(target != null && target != 'undefined') {
            target.text("Connect");
            target.val("Connect");
            if (target.hasClass("btn-danger")) {
                target.removeClass("btn-danger");
                if (!target.hasClass("btn-success")) {
                    target.addClass("btn-success");
                }
            }
            if (target.hasClass("btn-disconnect")) {
                target.removeClass("btn-disconnect");
                if (!target.hasClass("btn-connect")) {
                    target.addClass("btn-connect");
                }
            }
            showHideElement(target, true);
        }
    }
}
function updateUIStatConnected(target, connected = true) {
    if(connected) {
        /* CONNECTED */
        if(target != null && target != 'undefined') {
            target.text("Connected");
            target.val("Connected");
            if (target.hasClass("stat-disconnected")) {
                target.removeClass("stat-disconnected");
            }
            if (!target.hasClass("stat-connected")) {
                target.addClass("stat-connected");
            }
        }
    }else{
        /* DISCONNECTED */
        if(target != null && target != 'undefined') {
            target.text("Disconnected");
            target.val("Disconnected");
            if (target.hasClass("stat-connected")) {
                target.removeClass("stat-connected");
            }
            if (!target.hasClass("stat-disconnected")) {
                target.addClass("stat-disconnected");
            }
        }
    }
}

function showHideElement(target, show = true, clsShow = 'inline-block') {
    if(target != null && target != 'undefined') {
        if(show) {
            target.css('display', clsShow);
        }else{
            target.css('display', 'none');
        }
    }
}

function showLoading(dur = 1000) {
	___loadingScreenEffect(true, "");
	setTimeout(() => {
		___loadingScreenEffect(false);
	}, 2000);
}