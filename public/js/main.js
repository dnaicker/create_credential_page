const ngrok_url = "http://09dc-41-13-108-83.ngrok.io";
const auth_token = "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkwKKnVybjp0cmluc2ljOndhbGxldHM6VW45TGpFNUVjN0ZCUFRvNzFURFpVQSIedXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpkZWZhdWx0GjCAevCcnadUa3HuncGb_YN6BFwU-jgBzgZZHR4hABloaRWyEVo2T1uqFz0lOTWSrf0iAA"

// ------------------------------
// on load
$(document).ready(function () { 
	$( "#modal_load" ).load( "modal.html" );
	// create dropdown of template ids
	load_template_ids();
});

// ------------------------------


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
			// build select options with template ids
			$("#template_id").append(build_select_field_type(JSON.parse(result.itemsJson)));
			
			// add event handler to selection options
			$("#select_template_id").change(function(e) {
				$("#show_fields").empty();

				console.log(this.value);
				get_template_json(this.value);
			});
		},
	});
}

// ------------------------------
function build_ui(data) {
	let arr = [];

	// build ui
	for(let field in data.template.fields) {
		let obj = {};

		obj['name'] = field;
		obj['description'] = data.template.fields[field].description;
		obj['optional'] = data.template.fields[field].optional;
		obj['type'] = data.template.fields[field].type;

		arr.push(build_ui_input(obj));
	}
	arr.push('<button input id="submit" type="submit" class="btn btn-lg btn-block btn-primary" style="margin-bottom: 10px; margin-top: 20px; width: 100%"><i class="fa-solid fa-check" style="margin-right: 10px"></i>Save</button>');
	$("#show_fields").append(arr.join(""));
	console.log(arr);
}

// ------------------------------
function build_ui_input(field) {
	let arr = [];

	arr.push("<div class='form-floating'>");
	arr.push(`<input type='${get_field_type_name(field.type)}' class='form-control template-field' name='${field.name}' id='${field.name}' placeholder='${field.description}' required style="margin-bottom: 10px;>`);
	arr.push(`<label class='form-label'>${field.description}</label>`);
	arr.push("</div>");

	return arr.join("");
}

function get_field_type_name(field_type_numeric_value) {
	switch (field_type_numeric_value) {
		case 0:
			return "text";
		case 1:
			return "number";
		case 2:
			return "checkbox";
		case 4:
			return "date";
		default:
			return "text";
	}
}

// ------------------------------
async function get_template_json(template_id) {
	const data = {};

	data['auth_token'] = auth_token;
	
	data['id'] = template_id;
	
	$.ajax({
		data: data,
		url: `${ngrok_url}/getCredentialTemplate`,
		type: "POST",
		success: function (result) {
			console.log(result);
			// build ui
			build_ui(result);
		},
	});
}
// ------------------------------
$("#show_fields").submit(function (e) {
	console.log('clicked');
	e.preventDefault();
	const arr = transform_rows_to_object($(this).serializeArray());
	console.log(arr);
	if(validate_form()) {
		// send_data_to_server(arr);
	}
});

// ------------------------------
function transform_rows_to_object(arr) {
	// group three rows and create row object
	let count = 0;
	let new_obj = {}
	let new_obj_arr = []

	arr.forEach(element => {

		new_obj[element.name] = element.value;

		if (count >= 2) {
			count = 0;
			new_obj_arr.push(new_obj);
			new_obj = {};
			return;
		}

		count++;

	});

	return new_obj_arr;
}


// ------------------------------
// validate if input fields have values
function validate_form() {
	const credential_template_form = document.getElementById('show_fields')
	credential_template_form.classList.add('was-validated');
	
	if (credential_template_form.checkValidity() === false) {
		show_modal('Error', 'Please complete all input fields.');
		return false;
	}

	return true;
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
	arr.push("<div>");
	arr.push("<label class='form-label'>Select Credential Template ID</label>");
	arr.push("<select id='select_template_id' class='form-select template-field form-control' name='type' required >");
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