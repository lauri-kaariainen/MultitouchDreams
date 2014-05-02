	/*
	* Author Lauri Kääriäinen,
	* Original Author Ted Johnson, Graphics Program Manager Lead, Internet Explorer
	* his blog had heavy influence on my implementation:
	* http://blogs.msdn.com/b/ie/archive/2011/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx
	* LICENSE: Please don't offend original dude, I've no idea what license that was written on.
	* IDGAF what you use this on, commercial or no.
	*
	*/
{
	var lastXY = {};
	//elemList should include objects which include $(Elem), pointerId. 
	var elemList = {};
	var classNameToMatch = "dragTarget";
	function DoEvent(eventObject) {
		// stop panning and zooming so we can draw
		if (eventObject.preventManipulation)
			eventObject.preventManipulation();
		 
		//zooming-stop doesn't work in android 2.3.5.
		// we are handling this event
		if (eventObject.preventDefault)
			eventObject.preventDefault();
		eventObject.preventDefault();

		//this is done b/c firefox doesn't have scrElement.
		eventObject.srcElement = eventObject.srcElement ? eventObject.srcElement : eventObject.target;

		
		// if we have an array of changedTouches, use it, else create an array of one with our eventObject
		var touchPoints = (typeof eventObject.changedTouches != 'undefined') ? eventObject.changedTouches : [eventObject];
		for (var i = 0; i < touchPoints.length; ++i) {
			var touchPoint = touchPoints[i];
			// pick up the unique touchPoint id if we have one or use 1 as the default
			var touchPointId = (typeof touchPoint.identifier != 'undefined') ? touchPoint.identifier : (typeof touchPoint.pointerId != 'undefined') ? touchPoint.pointerId : 1;
			 
			if (eventObject.type.match(/(down|start)$/i)) {
				// process mousedown, MSPointerDown, and touchstart
				lastXY[touchPointId] = { x: touchPoint.pageX, y: touchPoint.pageY };
			
				if($(eventObject.srcElement).attr('class').match(classNameToMatch)) {
					elemList[touchPointId] = eventObject.srcElement;
		
				
					startMove(touchPointId,touchPoint.pageX,touchPoint.pageY);
				}		
				
			}
			else if (eventObject.type.match(/move$/i)) {
				// process mousemove, MSPointerMove, and touchmove
				if (lastXY[touchPointId] && !(lastXY[touchPointId].x == touchPoint.pageX && lastXY[touchPointId].y == touchPoint.pageY)) {
					lastXY[touchPointId] = { x: touchPoint.pageX, y: touchPoint.pageY };
			

					extendMove(touchPointId,touchPoint.pageX,touchPoint.pageY);
					
				}
			}
			else if (eventObject.type.match(/(up|end)$/i)) {
			
				delete lastXY[touchPointId];
				delete elemList[touchPointId];
			
			
			}
			
		}
	}
	function startMove(id,x,y){
		var realY = y - $(elemList[id]).css('height').replace("px",'')/2;
		var realX = x - $(elemList[id]).css('width').replace("px",'')/2;
		$(elemList[id]).css({"top":realY+"px","left": realX+"px"});
	}
	
	function extendMove(id,x,y){
		var realY = y - $(elemList[id]).css('height').replace("px",'')/2;
		var realX = x - $(elemList[id]).css('width').replace("px",'')/2;
		$(elemList[id]).css({"top":realY+"px","left": realX+"px"});
	}
	function stopMove(id,x,y){

	}

	 $("."+classNameToMatch).css({
    '-ms-touch-action' :    'none',
    'touch-action' :        'none'});
	var eventString = "MSPointerMove touchmove mousemove MSPointerDown touchstart mousedown MSPointerUp touchend mouseup";
	
	for (var i = 0; i < eventString.split(' ').length;i++)
		$('body')[0].addEventListener(eventString.split(' ')[i],DoEvent);
}
