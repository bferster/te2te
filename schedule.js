class Schedule  {																					

	constructor()   																		// CONSTRUCTOR
	{
		this.meetingStart=new Date();																// Meeting start
		this.now=0;																					// Now for meeting
		this.schedule=[];																			// Holds schedule
		this.curZoom="";																			// Current zoom link
	}
	
	GeEventByRoom(floor, room)																	// GET EVENT FOR A ROOM
	{
		let i;
		for (i=0;i<this.schedule.length;++i)
			if ((this.schedule[i].room == room) && (this.schedule[i].floor == floor))
				return this.schedule[i];
		return { link:"", content:"", title:"", desc:"", room:room };
	}

	ShowSchedule()																				// SHOW EVENT SCHEDULE
	{
		let i,j=0,r,s,sc;
		let mons=["January","February","March","April","May","June","July","August","September","October","November","December"];
		let days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		app.CloseAll();																			// Close all open dialogs
		let str=`<div id="co-sched" class="co-sched" style=";
			left:${$(app.vr).offset().left}px;top:0;
			width:${$(app.vr).width()-48}px; height:${$(app.vr).height()-48}px">
			<b style="'font-size:30px">Event schedule</b>
			<img style="float:right;cursor:pointer" src="img/closedot.png" onclick="$('#co-sched').remove()"><br><br>
			<div style="height:calc(100% - 48px);width:100%;overflow-y:auto;text-align:left">`;
			str+=`<div style="background-color:#5b66cb;width:calc(100% - 8px);padding:4px;color:#fff;text-align:center">
				${days[this.meetingStart.getDay()]}, ${mons[this.meetingStart.getMonth()]} ${this.meetingStart.getDate()}</div><br><b>`
			str+=this.schedule[0].start+" to "+this.schedule[0].end+"</b><table style='width:100%'>";
			for (i=1;i<this.schedule.length;++i) {													// For each event
				sc=this.schedule[i];																// Point at schedule
				if (!sc.desc)	continue;															// Skip those with no desc
				r=this.schedule[i].room;															// Point at rooom
				s=app.venue[sc.floor][r].title+(sc.parent ? " in "+sc.parent : "");					// Event location
				str+=`<tr style="vertical-align:top">
				<td style="margin-left:16px"><input type="checkbox" id="co-Sc-${i}" ${sc.going ? " checked" : ""}></td>
				<td>${sc.desc}</td>
				<td style="text-align:right;font-weight:bold;color:${app.venue[sc.floor][r].rug}">${s}</td>
				</tr>`
				}
		str+="</table></div></div>";
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Add schedule
		
		$("#co-sched").show("slide",{ direction:"down" });											// Slide up
		$("[id^=co-Sc-]").on("click", (e)=>{ 														// ON CHECK CLICK
			let id=e.currentTarget.id.substr(6);													// Get id
			this.schedule[id].going=$("#"+e.currentTarget.id).prop("checked");						// Store checked status
			}); 			
	}

	ShowAttendees()																				// SHOW THE ATTENDEES
	{
		let i,selects=[];
		app.CloseAll();																				// Close all open dialogs
		app.chat.curChat=-1;																		// Not chatting with anyone
		let x=$("#co-attendees").offset().left-133;													// Left
		let y=$("#co-attendees").offset().top-50-app.by/2											// Top
		let str=`<div id="co-people" class="co-people" style="left:${x}px;top:${y}px;background-color:#eee">
			<img style="float:right;cursor:pointer;margin-top:5px" src="img/closedot.png" onclick="$('#co-people').remove()">
			<div style='text-align:center;font-size:18px'><b>Attendees</b></div><br>
			<div id="co-spp"style="overflow-x:hidden;overflow-y:auto;height:calc(100% - 140px);margin-bottom:12px;background-color:#fff;border:1px solid #999">
			</div><table>
			<tr><td>Sort by </td><td><select class="co-is" id="co-sps" style="width:148px">
			<option>None</option><option>Name</option><option>Organization</option></select></td></tr>
			<tr><td>In </td><td><select class="co-is" id="co-spr" style="width:148px"></select></td></tr>	
			<tr><td>Find </td><td><input class="co-is" id="co-spf" style="width:130px;height:21px;" placeholder="Type here"></td></tr></table>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));
		$("#co-spr").append("<option>Any area</option><option>Hallway");
		fillPeople();
		
		for (i=1;i<app.venue[app.curFloor].length;++i)	$("#co-spr").append("<option>"+app.venue[app.curFloor][i].title+"</option>");
		
		$("#co-spr").on("change",()=>{ fillPeople() });
		$("#co-sps").on("change",()=>{ fillPeople() });
		$("#co-spf").on("change",()=>{ fillPeople() });

		function fillPeople() {																// FILL PEOPLE TABLE
			let i,o,r,s,str="<br>"
			selects=[];																			// Start fresh
			let room=$("#co-spr").prop("selectedIndex");										// Get room index
			let sort=$("#co-sps").prop("selectedIndex");										// Sort
			let find=$("#co-spf").val();														// Search term
			for (i=0;i<app.people.length;++i) {													// For each person
				o=app.people[i];																// Point at person											
				if (o.stats == "Q")	continue;													// Skip quiet people
				if (find) {																		// Filtering by search
					r=RegExp(find,"i");															// Turn into regex
					s=o.firstName+o.org+o.title+o.ints;											// Search all fields															
					if (!s.match(r)) continue;													// Skip if not a match
					}	
				if (room) {																		// If filtering by room
					if ((room == 1) && (o.stats != "A"))				continue;				// Only active people in hallway
					else if ((room > 1) && ("R"+(room-1) != o.stats))	continue;				// Show only people in the room
					}
				selects.push({index:i, org:o.org, name:o.lastName });							// Add to selects
				}
			if (sort == 1)		selects.sort((a,b)=>{ return (a.name > b.name) ? 1 : -1 });		// Sort by name
			else if (sort == 2)	selects.sort((a,b)=>{ return (a.org > b.org) ? 1 : -1 });		// Sort by org

			for (i=0;i<selects.length;++i) {													// For each selected person
				let o=app.people[selects[i].index];												// Point at person
				str+=`<div style="vertical-align:top"><div style="float:left;text-align:left;width:100%">
				<div style="float:left;width:40px;height:40px;overflow:hidden;border-radius:64px;margin:0 8px 16px 4px;border:1px solid #999">
				<img id="co-spi-${selects[i].index}" style="cursor:pointer;width:40px;" 
				src="${o.pic}"></div>
				<b>${o.firstName} ${o.lastName}</b><br>${o.title}<br>${o.org}</div></div>`;
				}
			$("#co-spp").html(str);																// Add to listing
			$("[id^=co-spi-]").on("click",(e)=>{												// ON PIC CLICK
				let id=e.target.id.substr(7)-0;													// Get index
				app.chat.ShowCard(id);															// Show card
				});
			}
	}

	ShowLink(link)																				// SHOW LINK
	{
		app.CloseAll(3);																			// Close all open dialogs except video/iframes
		$("#co-videoBar").remove();																	// Remove video bar
		if (link && link.match(/zoom/i)) {															// If Zoom
			this.curZoom=link;																		// Save link
			window.onfocus=()=>{ 																	// If main is back in focus
				let str=`<div id="co-videoBar" class="co-alert" 
				style="left:${app.bx/4+16}px;width:${app.bx/2-24}px;background-color:#5b66cb">
				Click here to return to last Zoom room</div>`;
				$("body").append(str.replace(/\t|\n|\r/g,""));										// Add return bar
				app.GoToCenter();																	// Got to center of hall
				$("#co-videoBar").on("click",()=>{
					let myWin=window.open(link,"_blank","scrollbars=no,toolbar=no,status=no,menubar=no");	// Open zoom link
					setTimeout(function(){ myWin.close(); },10000);									// Close after 10 secs
					});						
				}
			window.onblur=()=>{ $("#co-videoBar").remove();	}										// If main is out, remove bar
			let myWin=window.open(link,"_blank","scrollbars=no,toolbar=no,status=no,menubar=no");	// Open zoom link
			setTimeout(function(){ myWin.close(); },10000);											// Close after 10 secs
			}
		else{																						// Use iframe
			if (link && link.match(/zapp/i) && isMobile) {											// If zoom mobile
				let str="zoomus://zoom.us/join?confno="+link.split("?")[1];							// Make mobile url
				this.ShowLink(str);																	// Open with native app							
				return;																				// Quit
				}
			if (link && link.match(/zapp/i)) link+="&"+app.KZ										// If zoom app, add k
			let str=`<div id="co-iframe" class="co-card"' style="margin:0;padding:0;box-shadow:none;
			left:${$(app.vr).offset().left}px;top:${$(app.vr).offset().top}px;
			width:${$(app.vr).width()-1}px; height:${($(app.vr).width())*.5625}px">
			<div style="position:absolute;top:4px; left:calc(100% - 24px);background-color:#fff;width:18px;height:18px;border-radius:180px">
			<img id="co-ifc" style="cursor:pointer;padding:1px 0 0 0" src="img/closedot.png"></div>
			<iframe style="width:100%;height:100%" src="${link}" allow=camera;microphone;autoplay frameborder="0" allowfullscreen></iframe>`;
			$("body").append(str.replace(/\t|\n|\r/g,""));											// Add it
			
			$("#co-ifc").on("click", ()=>{															// ON CLOSE BUT
				$("#co-iframe").remove();															// Close window
				app.GoToCenter();																	// Go to center
				});	
			}
	}

} // Class closure