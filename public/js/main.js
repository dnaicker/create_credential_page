const ngrok_url = "http://d9e6-105-224-241-222.ngrok.io";
const auth_token = "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEmAKKnVybjp0cmluc2ljOndhbGxldHM6TmFBUVpvN3FDWWdrMk45TExta1RUQiIydXJuOnRyaW5zaWM6ZWNvc3lzdGVtczp2aWdvcm91cy1rZWxsZXItRllSR2ZkRVdaWHQaMJK76tJBHrph2GiNhsBiS6oH7YbkvoF7ESrWLjKxiPy8rZFyxrBO8ZyHqBwxdPYA1CIA"

// ------------------------------
// on load
$(document).ready(function () { 
	load_template_ids();
});

// ------------------------------
async function load_template_ids() {
	const data = {}

	data['auth_token'] = auth_token;

	data['query'] = 'SELECT * FROM c';

	$.ajax({
		dataType: 'json',
		data: data,
		url: `${ngrok_url}/searchTemplate`,
		type: "POST",
		success: function (result) {
			// loop through and use id as selection option value and text
			// create selection options
			// add to form
			$("#template_id").append(build_select_field_type(JSON.parse(result.itemsJson)));
		},
	});
}

// ------------------------------
async function save_credential_values() {
	let data = {};

	data['auth_token'] = auth_token;
	
	// get select option value
	data['template_id'] = "";

	// { field_name: value, field_name: value, ... }
	data['credential_values'] = ""	

	$.ajax({
		dataType: 'json',
		data: data,
		url: `${ngrok_url}/insertCredentialTemplateValues`,
		type: "POST",
		success: function (result) {
			console.log(result);
			show_modal('Success', '<b>' + result + '</b> was created successfully');
		},
	});
}

// ==============================

// ------------------------------
function build_select_field_type(data) {
	let arr = [];
	arr.push("<div class='col-8'>");
	arr.push("<label class='form-label'>Select Credential Template ID</label>");
	arr.push("<select class='form-select template-field form-control' name='type' required >");
	for (let i = 0; i < data.length; i++) {
		arr.push("<option value='" + data[i].id + "'>" + data[i].id + "</option>");
	}
	arr.push("</select>");
	arr.push("</div>");
	return arr.join("");
}

// ------------------------------
function show_modal(header, body) {
	$("#modal_header")[0].innerHTML = header;
	$("#modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#modal").modal('show');
}

// ------------------------------
function show_confirmation_modal(header, body, confirm_callback) {
	$("#confirmation_modal_header")[0].innerHTML = header;
	$("#confirmation_modal_body")[0].innerHTML = "<p>" + body + "</p>";
	$("#confirmation_modal").modal('show');
	$("#modal_button_confirm").on("click", function (e) {
		confirm_callback();
		$("#confirmation_modal").modal('hide');
	});
}