//Copy Calibration Coefficients for IN1002 here
bsrscale=744.921596
bsroffset=-2.773498
bsgscale=386.037356
bsgoffset=-2.584787
bsbscale=376.834689
bsboffset=-2.810157
fsrscale=417.191418
fsroffset=-31.436553
fsgscale=215.475063
fsgoffset=-33.646554
fsbscale=193.076584
fsboffset=-35.801119
//
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//Do Not Modify bellow this line.
//
//
reader = new FileReader();
lines = new Array();

uploading_config = false;

default_config = 
{
	"aP" : 1.0,
	"aT" : 1.0,
	"aRH" : 1.0,
	"aBR" : bsrscale/1000000,
	"aFR" : fsrscale/1000000,
	"aBG" : bsgscale/1000000,
	"aFG" : fsgscale/1000000,
	"aBB" : bsbscale/1000000,
	"aFB" : fsbscale/1000000,

	"bP" : 0.0,
	"bT" : 0.0,
	"bRH" : 0.0,
	"bBR" : bsroffset/1000000,
	"bFR" : fsroffset/1000000,
	"bBG" : bsgoffset/1000000,
	"bFG" : fsgoffset/1000000,
	"bBB" : bsboffset/1000000,
	"bFB" : fsboffset/1000000,
	"ar_ratio": 1.0,
	"ag_ratio": 1.0,
	"ab_ratio": 1.0,
	"n2r_ratio": 1.1525,
	"n2g_ratio": 1.1525,
	"n2b_ratio": 1.1525,
	"co2r_ratio": 2.61,
	"co2g_ratio": 2.61,
	"co2b_ratio": 2.61,
	"sf6r_ratio": 6.74,
	"sf6g_ratio": 6.74,
	"sf6b_ratio": 6.74,
	"ar_scat": 0.00000647,
	"ag_scat": 0.0000133,
	"ab_scat": 0.00002459,
	"n2r_scat": 0.0000067773,
	"n2g_scat": 0.000013964,
	"n2b_scat": 0.000025894,
	"co2r_scat": 0.00001674,
	"co2g_scat": 0.00003449,
	"co2b_scat": 0.00006396,
	"sf6r_scat": 0.0000763,
	"sf6g_scat": 0.0000763,
	"sf6b_scat": 0.0000763,
	"ar_btratio": 0.5,
	"ag_btratio": 0.5,
	"ab_btratio": 0.5,
	"n2r_btratio": 0.5,
	"n2g_btratio": 0.5,
	"n2b_btratio": 0.5,
	"co2r_btratio": 0.5,
	"co2g_btratio": 0.5,
	"co2b_btratio": 0.5,
	"sf6r_btratio": 0.5,
	"sf6g_btratio": 0.5,
	"sf6b_btratio": 0.5
};

config = default_config;
rbacks = new Array();
gbacks = new Array();
bbacks = new Array();
rforws = new Array();
gforws = new Array();
bforws = new Array();
rcoeffs = new Array();
gcoeffs = new Array();
bcoeffs = new Array();
pressures = new Array();
temperatures = new Array();
humidities = new Array();

TIMEs = new Array();

reader.onload = function(event)
{
	if (uploading_config == true)
	{
		settings = JSON.parse(event.target.result)
		
		config = settings;
	}
	else
	{
		lines = event.target.result.split("\n");
		data_count = lines[0].split(",").length;
		
		if (lines < 1)
		{
			document.getElementById("data_plotter").disabled = false;
			document.getElementById("data_saver").disabled = false;
			
			document.getElementById("load_log").innerHTML = "Warning: The file is empty.";
		}
		else if (data_count < 16)
		{
			document.getElementById("data_plotter").disabled = false;
			document.getElementById("data_saver").disabled = "disabled";
			
			document.getElementById("load_log").innerHTML = "Error: The file does not have enough values on each line.";
		}
		else
		{
			document.getElementById("calibrate_button").disabled = "";
			document.getElementById("export_button").disabled = "";
			
			process_data();
		}
	}
	
	uploading_config = false;
};

function change_master_line()
{
	value = document.getElementById("time_slider").value;
	document.getElementById("calib_master_line").value = value;

	width = document.getElementById("plot_1").width - 80 * 2;
	left = padding + (value / (lines.length - 1)) * width;
	
	document.getElementById("line_1").style.left = left + "px";
	document.getElementById("line_2").style.left = left + "px";
	document.getElementById("line_3").style.left = left + "px";
}

function set_master_line()
{
	value = document.getElementById("calib_master_line").value;
	
	document.getElementById("time_slider").value = value;
	
	change_master_line();
}

function save(gas_num, place)
{
	value = parseInt(document.getElementById("calib_master_line").value);
	
	start = document.getElementById("gas_" + gas_num + "_start").value;
	end = document.getElementById("gas_" + gas_num + "_end").value;
	
	if (start === "")
		start = 0;
	
	if (end !== "" && place == "start" && value >= end)
	{
		alert("Start would be greater than end...");
		return;
	}
	else if (place == "end" && value <= start)
	{
		alert("End would be less than start...");
		return;
	}
	
	document.getElementById("gas_" + gas_num + "_" + place).value = value;
}

function load_data_file()
{
	file = document.getElementById("data_upload").files[0];
			reader.readAsText(file);
}

function load_config_file()
{
	uploading_config = true;
	
	file = document.getElementById("config_upload").files[0];
	
	reader.readAsText(file);
}

function show_calibration_info()
{
	document.getElementById("calib_master_line").value = 0;
	document.getElementById("time_slider").max = lines.length - 2;
	
	info_div = document.getElementById("calibration_info");
	
	if (info_div.style.display != "block")
		info_div.style.display = "block";
	else
		info_div.style.display = "none";
}

function process_data()
{
	RayleighF = function (t, p, c)
	{
		p0 = 101.3;
		t0 = 293.0;
		

		t += 273.0;
		
		value = (p / p0) * (t0 / t);
		
		if (c == "r")
			value *= config.ar_scat * (1 - config.ar_btratio);
		else if (c == "g")
			value *= config.ag_scat * (1 - config.ag_btratio);
		else if (c == "b")
			value *= config.ab_scat * (1 - config.ab_btratio);
		
		return value;
	};
	
	RayleighB = function (t, p, c)
	{
		p0 = 101.3;
		t0 = 293.0;

		t += 273.0;
		
		value = (p / p0) * (t0 / t);
		
		if (c == "r")
			value *= config.ar_scat * config.ar_btratio;
		else if (c == "g")
			value *= config.ag_scat * config.ag_btratio;
		else if (c == "b")
			value *= config.ab_scat * config.ab_btratio;
		
		return value;
	};
	
	rbacks.length = 0;
	gbacks.length = 0;
	bbacks.length = 0;
	rforws.length = 0;
	gforws.length = 0;
	bforws.length = 0;
	rcoeffs.length = 0;
	gcoeffs.length = 0;
	bcoeffs.length = 0;
	pressures.length = 0;
	temperatures.length = 0;
	humidities.length = 0;

        TIMEs.length = 0;
	
	for (i = 1; i < lines.length - 1; i++)
	{
		data = lines[i].split(",");
		
		if (data.length < 19)
		{
			document.getElementById("load_log").innerHTML = "Error parsing data. Line "
				+ (i + 1) + " did not have enough data points.";
			
			return 1;
		}
		
		if (data.length > 1)
		{
			serialnumber = data[0];
			TIME = data[1];
			FR = parseFloat(data[2]);
			FR_R = parseFloat(data[3]);
			FG = parseFloat(data[4]);
			FG_R = parseFloat(data[5]);
			FB = parseFloat(data[6]);
			FB_R = parseFloat(data[7]);
			BR = parseFloat(data[8]);
			BR_R = parseFloat(data[9]);
			BG = parseFloat(data[10]);
			BG_R = parseFloat(data[11]);
			BB = parseFloat(data[12]);
			BB_R = parseFloat(data[13]);
			T = parseFloat(data[14]);
			P = parseFloat(data[15]);
			RH = parseFloat(data[16]);
			D = parseFloat(data[17]);
			FD_R = parseFloat(data[18]);
			BD_R = parseFloat(data[19]);
			
			pressure = config.aP * P + config.bP;
			temperature = config.aT * T + config.bT;
			humidity = config.aRH * RH + config.bRH;
			
			pressures.push(pressure);
			temperatures.push(temperature);
			humidities.push(humidity);
			
			sigBack = (BR - D) / (BR_R - BD_R);
			sigFwd = (FR - D) / (FR_R - FD_R);
			back = sigBack * config.aBR + config.bBR - RayleighB(temperature, pressure, "r");
			fwd = sigFwd * config.aFR + config.bFR - RayleighF(temperature, pressure, "r");
			rcoeff = back + fwd;
			
      		rbacks.push(back);
			rforws.push(fwd);
			
			rcoeffs.push(rcoeff);

                  TIMEs.push(TIME);

			sigBack = (BG - D) / (BG_R - BD_R);
			sigFwd = (FG - D) / (FG_R - FD_R);
			back = sigBack * config.aBG + config.bBG - RayleighB(temperature, pressure, "g");
			fwd = sigFwd * config.aFG + config.bFG - RayleighF(temperature, pressure, "g");
			gcoeff = back + fwd;
			
			gbacks.push(back);
			gforws.push(fwd);
			
			gcoeffs.push(gcoeff);
			
			sigBack = (BB - D) / (BB_R - BD_R);
			sigFwd = (FB - D) / (FB_R - FD_R);
			back = sigBack * config.aBB + config.bBB - RayleighB(temperature, pressure, "b");
			fwd = sigFwd * config.aFB + config.bFB - RayleighF(temperature, pressure, "b");
			bcoeff = back + fwd;
			
			bbacks.push(back);
			bforws.push(fwd);
			
			bcoeffs.push(bcoeff);
		}
	}
	
	colors = new Array("red", "green", "blue");
	
	plot("plot_1", "line_1", new Array(rcoeffs, gcoeffs, bcoeffs), "Scattering Coefficient", colors, 8);
	plot("plot_2", "line_2", new Array(rbacks, gbacks, bbacks), "Backscattering", colors, 8);
	plot("plot_3", "line_3", new Array(pressures, temperatures, humidities), "Misc. Gauges", colors, 2);
}

function plot(canvas_id, line_id, data_sets, graph_title, line_colors, precision)
{
	width = 800;
	height = 400;
	padding = 80;
	
	min_x = 0.0, max_x = 0.0;
	min_y = 0.0, max_y = 0.0;
	
	graph = document.getElementById(canvas_id);
	context = graph.getContext("2d");
	
	line = document.getElementById(line_id);
	line_context = line.getContext("2d");
	
	graph.width = width;
	graph.height = height;
	
	graph.style.border = "1px solid #888";
	
	line.width = 2
	line.height = height - padding * 2;
	
	line.style.left = padding + "px";
	line.style.top = padding + "px";
	
	line_context.fillStyle = "red";
	line_context.globalAlpha = 0.7;
	line_context.fillRect(0, 0, line.width, line.height);
	line_context.fill();
	
	context.clearRect(0, 0, width, height);
	context.fillStyle = "white";
	context.fillRect(0, 0, width, height);
	context.fill();

	max_x = data_sets[0].length;
	
	for (i = 0; i < data_sets.length; i++)
	{
		for (j = 0; j < data_sets[i].length; j++)
		{
			if (data_sets[i][j] > max_y)
				max_y = data_sets[i][j];
		}
	}
	
	context.beginPath();
	context.fillStyle = "black";
	context.font = "bold 16pt sans-serif";
	context.textAlign = "center";
	
	context.fillText(graph_title, (width / 2), (padding / 2));
	
	context.beginPath();
	context.strokeStyle = "lightgrey";
	context.lineWidth = "2";
	
	for (i = (max_x / 10); i <= max_x; i += (max_x / 10))
	{
		x = (i / max_x) * (width - padding * 2);
		
		context.moveTo((padding + x), (height - padding));
		context.lineTo((padding + x), padding);
	}
	
	for (i = 0; i < max_y; i += (max_y / 10))
	{
		y = (i / max_y) * (height - padding * 2);
		
		context.moveTo(padding, (padding + y));
		context.lineTo((width - padding), (padding + y));
	}
	
	context.stroke();
	
	context.beginPath();
	context.strokeStyle = "black";
	context.lineWidth = "2";
	
	context.moveTo(padding, padding);
	context.lineTo(padding, (height - padding));
	context.moveTo(padding, (height - padding));
	context.lineTo((width - padding), (height - padding));
	
	context.stroke();
	
	context.beginPath();
	context.fillStyle = "black";
	context.font = "bold 9pt sans-serif";
	context.textAlign = "center";
	context.textBaseline = "top";

	for (i = 0; i <= max_x; i += (max_x / 10))
	{
		x = (i / max_x) * (width - padding * 2);

		context.fillText(i.toFixed(1), (padding + x), (height - padding + 5));

	}
	
	context.beginPath();
	context.fillStyle = "black";
	context.font = "bold 9pt sans-serif";
	context.textAlign = "end";
	context.textBaseline = "middle";
	
	for (i = 0; i <= max_y; i += (max_y / 10))
	{
		y = (i / max_y) * (height - padding * 2);
		
		context.fillText((max_y - i).toFixed(precision), (padding - 5), (padding + y));
	}
	
	for (i = 0; i < data_sets.length; i++)
	{
		context.beginPath();
		context.strokeStyle = line_colors[i];
		context.lineWidth = 2;
		
		for (j = 0; j < data_sets[i].length - 1; j++)
		{
			value = data_sets[i][j];
			
			x = (j / (max_x)) * (width - padding * 2) + padding;
			y = ((max_y - value) / max_y) * (height - padding * 2) + padding;
			
			context.moveTo(x, y);
			
			value = data_sets[i][j + 1];
			
			a = ((j + 1) / (max_x)) * (width - padding * 2) + padding;
			b = ((max_y - value) / max_y) * (height - padding * 2) + padding;
			
			context.quadraticCurveTo(x, y, a, b);
		}
		
		context.stroke();
	}
}

function perform_calibration()
{
	gas_1_start = document.getElementById("gas_1_start").value;
	gas_1_end = document.getElementById("gas_1_end").value;
	gas_2_start = document.getElementById("gas_2_start").value;
	gas_2_end = document.getElementById("gas_2_end").value;
	
	gas_1_radios = document.getElementsByName("gas_1");
	gas_2_radios = document.getElementsByName("gas_2");
	
	gas_1 = 0;
	gas_2 = 0;
	
	rback_average_1 = 0.0;
	rback_average_2 = 0.0;
	
	rforw_average_1 = 0.0;
	rforw_average_2 = 0.0;
	
	gback_average_1 = 0.0;
	gback_average_2 = 0.0;
	
	gforw_average_1 = 0.0;
	gforw_average_2 = 0.0;
	
	bback_average_1 = 0.0;
	bback_average_2 = 0.0;
	
	bforw_average_1 = 0.0;
	bforw_average_2 = 0.0;
	
	temperature_AVG_1 = 0.0;
	temperature_AVG_2 = 0.0;
	pressure_AVG_1 = 0.0;
	pressure_AVG_2 = 0.0;

	for (i = 0; i < gas_1_radios.length; i++)
	{
		if (gas_1_radios[i].checked)
			gas_1 = i;
	}
	
	for (i = 0; i < gas_2_radios.length; i++)
	{
		if (gas_2_radios[i].checked)
			gas_2 = i;
	}
	
	for (i = 0; i < rbacks.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			rback_average_1 += rbacks[i];
		
		if (i >= gas_2_start && i <= gas_2_end)
			rback_average_2 += rbacks[i];
	}

	for (i = 0; i < rforws.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			rforw_average_1 += rforws[i];

		if (i >= gas_2_start && i <= gas_2_end)
			rforw_average_2 += rforws[i];

		if (i >= gas_1_start && i <= gas_1_end)
			temperature_AVG_1 += temperatures[i];
		if (i >= gas_2_start && i <= gas_2_end)
			temperature_AVG_2 += temperatures[i];

		if (i >= gas_1_start && i <= gas_1_end)
			pressure_AVG_1 += pressures[i];
		if (i >= gas_2_start && i <= gas_2_end)
			pressure_AVG_2 += pressures[i];

	}
	
	rback_average_1 /= (gas_1_end - gas_1_start +1);
	rback_average_2 /= (gas_2_end - gas_2_start +1);	

	rforw_average_1 /= (gas_1_end - gas_1_start +1);
	rforw_average_2 /= (gas_2_end - gas_2_start +1);

	temperature_AVG_1 /= (gas_1_end - gas_1_start +1);
	pressure_AVG_1 /= (gas_1_end - gas_1_start +1);
	temperature_AVG_2 /= (gas_2_end - gas_2_start +1);
	pressure_AVG_2 /= (gas_2_end - gas_2_start +1);

	scatt_cr_1 = 0.0;
	scatt_cr_2 = 0.0;
	bt_ratio_1 = 0.0;
	bt_ratio_2 = 0.0;
	
	switch (gas_1)
	{
		default:
		case 0:
			scatt_cr_1 = config.ar_scat;
			bt_ratio_1 = config.ar_btratio;
			break;
		case 1:
			scatt_cr_1 = config.n2r_scat;
			bt_ratio_1 = config.n2r_btratio;
			break;
		case 2:
			scatt_cr_1 = config.co2r_scat;
			bt_ratio_1 = config.co2r_btratio;
			break;
		case 3:
			scatt_cr_1 = config.sf6r_scat;
			bt_ratio_1 = config.sf6r_btratio;
			break;
	}
	
	switch (gas_2)
	{
		default:
		case 0:
			scatt_cr_2 = config.ar_scat;
			bt_ratio_2 = config.ar_btratio;
			break;
		case 1:
			scatt_cr_2 = config.n2r_scat;
			bt_ratio_2 = config.n2r_btratio;
			break;
		case 2:
			scatt_cr_2 = config.co2r_scat;
			bt_ratio_2 = config.co2r_btratio;
			break;
		case 3:
			scatt_cr_2 = config.sf6r_scat;
			bt_ratio_2 = config.sf6r_btratio;
			break;
	}

	scatt_cr_1 *= 293.0 * (pressure_AVG_1 / 101.3) / (273.0 + temperature_AVG_1) ;
	scatt_cr_2 *= 293.0 * (pressure_AVG_2 / 101.3) / (273.0 + temperature_AVG_2) ;

	num = (scatt_cr_1 * bt_ratio_1) - (scatt_cr_2 * bt_ratio_2);
	denom = rback_average_1 - rback_average_2;
	
	config.aBR = num / denom;

	config.bBR = (scatt_cr_1 * bt_ratio_1) - (config.aBR * rback_average_1);
	
	num = (scatt_cr_1 * (1 - bt_ratio_1)) - (scatt_cr_2 * (1 - bt_ratio_2));

	denom = rforw_average_1 - rforw_average_2;
	
	config.aFR = num / denom;
	config.bFR = (scatt_cr_1 * (1 - bt_ratio_1)) - (config.aFR * rforw_average_1);
	
	for (i = 0; i < gbacks.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			gback_average_1 += gbacks[i];
		
		if (i >= gas_2_start && i <= gas_2_end)
			gback_average_2 += gbacks[i];
	}
	
	for (i = 0; i < gforws.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			gforw_average_1 += gforws[i];
		
		if (i >= gas_2_start && i <= gas_2_end)
			gforw_average_2 += gforws[i];
	}
	gback_average_1 /= (gas_1_end - gas_1_start +1);
	gback_average_2 /= (gas_2_end - gas_2_start +1);
	
	gforw_average_1 /= (gas_1_end - gas_1_start +1);
	gforw_average_2 /= (gas_2_end - gas_2_start +1);
	
	scatt_cr_1 = 0.0;
	scatt_cr_2 = 0.0;
	bt_ratio_1 = 0.0;
	bt_ratio_2 = 0.0;
	
	switch (gas_1)
	{
		default:
		case 0:
			scatt_cr_1 = config.ag_scat;
			bt_ratio_1 = config.ag_btratio;
			break;
		case 1:
			scatt_cr_1 = config.n2g_scat;
			bt_ratio_1 = config.n2g_btratio;
			break;
		case 2:
			scatt_cr_1 = config.co2g_scat;
			bt_ratio_1 = config.co2g_btratio;
			break;
		case 3:
			scatt_cr_1 = config.sf6g_scat;
			bt_ratio_1 = config.sf6g_btratio;
			break;
	}
	
	switch (gas_2)
	{
		default:
		case 0:
			scatt_cr_2 = config.ag_scat;
			bt_ratio_2 = config.ag_btratio;
			break;
		case 1:
			scatt_cr_2 = config.n2g_scat;
			bt_ratio_2 = config.n2g_btratio;
			break;
		case 2:
			scatt_cr_2 = config.co2g_scat;
			bt_ratio_2 = config.co2g_btratio;
			break;
		case 3:
			scatt_cr_2 = config.sf6g_scat;
			bt_ratio_2 = config.sf6g_btratio;
			break;
	}

	scatt_cr_1 *= 293.0 * (pressure_AVG_1 / 101.3) / (273.0 + temperature_AVG_1) ;
	scatt_cr_2 *= 293.0 * (pressure_AVG_2 / 101.3) / (273.0 + temperature_AVG_2) ;
	
	num = (scatt_cr_1 * bt_ratio_1) - (scatt_cr_2 * bt_ratio_2);
	denom = gback_average_1 - gback_average_2;
	
	config.aBG = num / denom;
	config.bBG = (scatt_cr_1 * bt_ratio_1) - (config.aBG * gback_average_1);
	
	num = (scatt_cr_1 * (1 - bt_ratio_1)) - (scatt_cr_2 * (1 - bt_ratio_2));
	denom = gforw_average_1 - gforw_average_2;
	
	config.aFG = num / denom;
	config.bFG = (scatt_cr_1 * (1 - bt_ratio_1)) - (config.aFG * gforw_average_1);
	
	for (i = 0; i < bbacks.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			bback_average_1 += bbacks[i];
		
		if (i >= gas_2_start && i <= gas_2_end)
			bback_average_2 += bbacks[i];
	}
	
	for (i = 0; i < bforws.length; i++)
	{
		if (i >= gas_1_start && i <= gas_1_end)
			bforw_average_1 += bforws[i];
		
		if (i >= gas_2_start && i <= gas_2_end)
			bforw_average_2 += bforws[i];
	}
	
	bback_average_1 /= (gas_1_end - gas_1_start +1);
	bback_average_2 /= (gas_2_end - gas_2_start +1);
	
	bforw_average_1 /= (gas_1_end - gas_1_start +1);
	bforw_average_2 /= (gas_2_end - gas_2_start +1);
	
	scatt_cr_1 = 0.0;
	scatt_cr_2 = 0.0;
	bt_ratio_1 = 0.0;
	bt_ratio_2 = 0.0;
	
	switch (gas_1)
	{
		default:
		case 0:
			scatt_cr_1 = config.ab_scat;
			bt_ratio_1 = config.ab_btratio;
			break;
		case 1:
			scatt_cr_1 = config.n2b_scat;
			bt_ratio_1 = config.n2b_btratio;
			break;
		case 2:
			scatt_cr_1 = config.co2b_scat;
			bt_ratio_1 = config.co2b_btratio;
			break;
		case 3:
			scatt_cr_1 = config.sf6b_scat;
			bt_ratio_1 = config.sf6b_btratio;
			break;
	}
	
	switch (gas_2)
	{
		default:
		case 0:
			scatt_cr_2 = config.ab_scat;
			bt_ratio_2 = config.ab_btratio;
			break;
		case 1:
			scatt_cr_2 = config.n2b_scat;
			bt_ratio_2 = config.n2b_btratio;
			break;
		case 2:
			scatt_cr_2 = config.co2b_scat;
			bt_ratio_2 = config.co2b_btratio;
			break;
		case 3:
			scatt_cr_2 = config.sf6b_scat;
			bt_ratio_2 = config.sf6b_btratio;
			break;
	}
	
	scatt_cr_1 *= 293.0 * (pressure_AVG_1 / 101.3) /(273.0 + temperature_AVG_1) ;
	scatt_cr_2 *= 293.0 * (pressure_AVG_2 / 101.3) /(273.0 + temperature_AVG_2) ;

	num = (scatt_cr_1 * bt_ratio_1) - (scatt_cr_2 * bt_ratio_2);
	denom = bback_average_1 - bback_average_2;
	
	config.aBB = num / denom;
	config.bBB = (scatt_cr_1 * bt_ratio_1) - (config.aBB * bback_average_1);
	
	num = (scatt_cr_1 * (1 - bt_ratio_1)) - (scatt_cr_2 * (1 - bt_ratio_2));
	denom = bforw_average_1 - bforw_average_2;
	
	config.aFB = num / denom;
	config.bFB = (scatt_cr_1 * (1 - bt_ratio_1)) - (config.aFB * bforw_average_1);
	
	process_data();

      w = window.open();

	w.document.writeln("Copy the lines bellow and save it inside a config.txt file");
        w.document.writeln("<br>");
        w.document.writeln("<br>");


	w.document.write("bsrscale=");
        w.document.writeln(config.aBR*1000000);
        w.document.writeln("<br>");

	w.document.write("bsroffset=");
	w.document.writeln(config.bBR*1000000);
        w.document.writeln("<br>");

	w.document.write("bsgscale=");
	w.document.writeln(config.aBG*1000000);
        w.document.writeln("<br>");

	w.document.write("bsgoffset=");
	w.document.writeln(config.bBG*1000000);
        w.document.writeln("<br>");

	w.document.write("bsbscale=");
	w.document.writeln(config.aBB*1000000);
        w.document.writeln("<br>");

	w.document.write("bsboffset=");
	w.document.writeln(config.bBB*1000000);
        w.document.writeln("<br>");

	w.document.write("fsrscale=");
        w.document.writeln(config.aFR*1000000);
        w.document.writeln("<br>");

	w.document.write("fsroffset=");
	w.document.writeln(config.bFR*1000000);
        w.document.writeln("<br>");

	w.document.write("fsgscale=");
	w.document.writeln(config.aFG*1000000);
        w.document.writeln("<br>");

	w.document.write("fsgoffset=");
	w.document.writeln(config.bFG*1000000);
        w.document.writeln("<br>");

	w.document.write("fsbscale=");
	w.document.writeln(config.aFB*1000000);
        w.document.writeln("<br>");

	w.document.write("fsboffset=");
	w.document.writeln(config.bFB*1000000);
        w.document.writeln("<br>");
        w.document.writeln("<br>");
     
       w.document.writeln("</p>");
       w.document.writeln("</p>");
       w.document.writeln("</p>");

	w.document.writeln("These lines represent the output of calibrated data and can be copied as part of an output file.");
        w.document.writeln("<br>");
        w.document.writeln("</p>");


        w.document.writeln("TotScatt_R(m-1),TotScatt_G(m-1),TotScatt_B(m-1),BackScatt_R(m-1),BackScatt_G(m-1),BackScatt_B(m-1)");
        w.document.writeln("<br>");
        w.document.writeln("</p>");
        
	for (i = 0; i < bforws.length; i++)
	{
      text = new Array(rcoeffs[i],gcoeffs[i],bcoeffs[i],rbacks[i],gbacks[i],bbacks[i]) 
	
	w.document.writeln(text);
     	w.document.writeln("<br>");
      }
}

function save_data()
{
      w = window.open();

        w.document.writeln("Date/Time,TotScatt_R(m-1),TotScatt_G(m-1),TotScatt_B(m-1),BackScatt_R(m-1),BackScatt_G(m-1),BackScatt_B(m-1)");
        w.document.writeln("</p>");

	for (i = 0; i < bforws.length; i++)
	{
      text = new Array(TIMEs[i],rcoeffs[i],gcoeffs[i],bcoeffs[i],rbacks[i],gbacks[i],bbacks[i]) 

	w.document.writeln(text);
     	w.document.writeln("<br>");
      }
}



