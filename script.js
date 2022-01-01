let canvas_html,draw;
let backgroundColor = "gray"
let currently_drawing = false // click to enable
let current_shape = "pen"
let colour = "black"; // pen default colour
let colour_options = [];
let option;
let width = 15 // pen default width
let brush_options = [5,15,25,35,45]; // in pixels
let oldX, oldY;
let pen_text = "🖍"

function start() { // Upon loading
	// Html elements
	document.getElementById('eraser').checked = false // Some browsers save it. I want to keep it off.
	brush_grid = document.getElementsByClassName('brush_grid')[0]
	brush_grid.style.gridTemplateColumns = "";
	for (var i = 0; i < brush_options.length; i++) {
		brush_option = document.createElement('div') // brush_option is brush_circle container
		brush_option.classList = "brush_option"
		brush_option.addEventListener("click", change_brush)
		brush_option.name = i
		brush_circle = document.createElement('div')
		brush_circle.classList = "brush_circle"
		brush_circle.name = i
		brush_grid.appendChild(brush_option)
		brush_option.appendChild(brush_circle)
		brush_circle.style.width = brush_options[i] + "px"
		brush_circle.style.height = brush_options[i] + "px"
		brush_grid.style.gridTemplateColumns += " 1fr"
		brush_circle.appendChild(create_pen())
	}
	colour_options = document.getElementsByClassName('colour_option')
	for (var i = colour_options.length - 1; i >= 0; i--) {
		colour_options[i].addEventListener("click", change_colour)
		colour_options[i].appendChild(create_pen())
	}
	shape_options = document.getElementsByClassName('shape_option')
	for (var i = shape_options.length - 1; i >= 0; i--) {
		shape_options[i].addEventListener("click", change_shape)
	}
	save_options = document.getElementsByClassName('save_option')
	for (var i = save_options.length - 1; i >= 0; i--) {
		save_options[i].addEventListener("click", change_save)
	}
	// JS variables
	canvas_html = document.getElementsByClassName('drawing_canvas')[0]
	canvas_html.addEventListener("click", click);
	canvas_html.addEventListener("mousemove", mousemove);
	draw = canvas_html.getContext('2d') // Ref: https://www.w3schools.com/graphics/canvas_drawing.asp
	canvas_width = window.innerWidth*0.85
	canvas_height = window.innerHeight
	console.log(canvas_height,canvas_width)
	canvas_html.width = canvas_width
	canvas_html.height = canvas_height
	canvas_html.style.backgroundColor = backgroundColor
	draw.lineCap = 'round'
}

function change_brush(e) {
	width = brush_options[e.target.name]
	unselect('brush_grid')
	e.target.classList.add('selected')
}

function change_colour(e) {
	unselect("colour_grid")
	draw.beginPath(); // avoid recolouring past draws
	e.target.classList.add('selected')
	colour = e.target.style.backgroundColor
	draw.strokeStyle = colour
}

function change_shape(e) {
	unselect("shape_grid")
	option = e.target.getAttribute("name")
	currently_drawing = false
	if (current_shape != option) {
		e.target.classList.add('selected')
		current_shape = option
		currently_drawing = false
	} else {
		current_shape = "pen"
	}
	/*if (current_shape=="text") {
		canvas_html.style.cursor = "text"
	} else {
		canvas_html.style.cursor = "default"
	}*/
	// note: For some reason, the text pointer goes "behind" the canvas. I have no clue how to fix that bug.
	// I've chosen to disable the feature since it makes it hell to draw.
}

function change_save(e) {
	option = e.target.getAttribute("name")
	console.log(option)
	if (option=="save") {
		draw.save()
		save_image = draw.getImageData(0,0,canvas_width,canvas_height)
	} else if (option=="restore") {
		draw.restore()
		draw.putImageData(save_image,0,0)
	} else if (option=="export") {
		save_file = canvas_html.toDataURL("image/png")
		save_file.replace("image/png", "image/octet-stream")
		document.getElementById('export').href = save_file
	}
}

function import_save() {
	save_file = document.getElementById('import')
	img = document.getElementById('import_placeholder')
	import_url = URL.createObjectURL(save_file.files[0])
	img.src = import_url
	img.onload = function() {
		draw.drawImage(img,0,0,canvas_width,canvas_height)
		//console.log(img)
	}
}

function click(e) {
	posX = e.clientX
	posY = e.clientY
	if (current_shape=="pen") {
		currently_drawing = !currently_drawing
		oldX = undefined
		if (currently_drawing) {
			draw.lineWidth = 1;
			draw.beginPath();
			draw.arc(posX, posY, width/2, 0, 2 * Math.PI);
			draw.fillStyle = colour
			draw.fill()
			draw.stroke(); 
		}
	} else {
		if (currently_drawing) {
			posX = e.clientX
			posY = e.clientY
			draw.lineWidth = width;
			draw.beginPath();
			draw.fillStyle = colour
			if (current_shape=="line") {
				draw.moveTo(oldX, oldY);
				draw.lineTo(posX, posY);
			} else if (current_shape.includes("rectangle")) {
				upperleftX = Math.min(oldX,posX)
				downrightX = Math.max(oldX,posX)
				upperleftY = Math.min(oldY,posY)
				downrightY = Math.max(oldY,posY)
				draw.rect(upperleftX, upperleftY, downrightX-upperleftX, downrightY-upperleftY)
			} else if (current_shape.includes("circle")) {
				radius = distance(oldX,oldY,posX,posY)
				draw.arc(oldX, oldY, radius, 0, 2 * Math.PI)
			}
			if (current_shape.includes("fill")) {
				draw.fill()
			}
			draw.stroke();
		} else {
			oldX = e.clientX
			oldY = e.clientY
		}
		if (current_shape.includes("text")) {
			draw.lineWidth = width/5
			text_size = width*3
			draw.font = `${text_size}px Georgia`
			text_to_add = prompt("Enter the text to add", "Hello World!")
			if (text_to_add!=null) {
				draw.strokeText(text_to_add, posX, posY);
			}
		}
		draw.stroke();
		currently_drawing = !currently_drawing
	}
}

function mousemove(e) {
	if ((currently_drawing) && (current_shape=="pen")) {
		posX = e.clientX
		posY = e.clientY
		if (oldX!=undefined) {
			draw.lineWidth = width;
			draw.beginPath();
			draw.moveTo(oldX, oldY);
			draw.lineTo(posX, posY);
			draw.stroke(); 
		}
		oldX = posX
		oldY = posY
	}
}

function eraser(is_checked) {
	if (is_checked) {
		draw.strokeStyle = backgroundColor;
		document.getElementsByClassName("eraser")[0].classList.add("selected")
	} else {
		draw.strokeStyle = colour;
		document.getElementsByClassName("eraser")[0].classList.remove("selected")
	}
}

function distance(x1,y1,x2,y2) {
	return Math.pow(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2), 1/2)
}

function unselect(menu_class) {
	if (document.getElementsByClassName(menu_class).length > 0) {
		selection = document.getElementsByClassName(menu_class)[0].getElementsByClassName('selected')
		for (var i = selection.length - 1; i >= 0; i--) {
			selection[i].classList.remove('selected')
		}
	}
}

function create_pen() {
	pen_icon = document.createElement('div')
	pen_icon.innerText = pen_text
	pen_icon.classList = "pen_icon"
	return pen_icon
}