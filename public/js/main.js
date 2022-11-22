const ngrok_url = "http://b9f0-2001-4200-7000-9-34f1-3d30-ee20-5218.ngrok.io";
const auth_token = "CiVodHRwczovL3RyaW5zaWMuaWQvc2VjdXJpdHkvdjEvb2Jlcm9uEkwKKnVybjp0cmluc2ljOndhbGxldHM6VW45TGpFNUVjN0ZCUFRvNzFURFpVQSIedXJuOnRyaW5zaWM6ZWNvc3lzdGVtczpkZWZhdWx0GjCAevCcnadUa3HuncGb_YN6BFwU-jgBzgZZHR4hABloaRWyEVo2T1uqFz0lOTWSrf0iAA"
let select_template_id = null;

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
				select_template_id = this.value;	
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
			// build ui
			build_ui(result);
		},
	});
}
// ------------------------------
$("#show_fields").submit(function (e) {
	e.preventDefault();

	const arr = transform_rows_to_object($(this).serializeArray());

	if(validate_form()) {
		console.log('send data to server');
		console.log(select_template_id);
		send_data_to_server(select_template_id, arr);
	}
});

// ------------------------------
function transform_rows_to_object(arr) {
	// group three rows and create row object
	let new_obj_arr = []

	arr.forEach(element => {
		new_obj_arr.push({[element.name]: element.value});
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
async function send_data_to_server(template_id, credential_values) {
	let data = {};

	data['auth_token'] = auth_token;
	
	// get select option value
	data['template_id'] = template_id;

	// { field_name: value, field_name: value, ... }
	data['credential_values'] = JSON.stringify(credential_values)

	console.log(credential_values);

	$.ajax({
		dataType: 'json',
		data: data,
		url: `${ngrok_url}/createCredential`,
		type: "POST",
		success: function (result) {
			console.log(result);
			const data = JSON.parse(result.valuesJson);
			console.log(data);
			show_modal('Success', '<b>' + data + '</b> was created successfully');
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