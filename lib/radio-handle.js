// http://zetawiki.com/wiki/HTML_%EB%9D%BC%EB%94%94%EC%98%A4_%EB%B2%84%ED%8A%BC
function get_cc_func_checked() {
	var obj = document.getElementsByName('radio_cc_func');
	var checked_index = -1;
	var checked_value = '';
	for( i=0; i<obj.length; i++ ) {
		if(obj[i].checked) {
			checked_index = i;
			checked_value = obj[i].value;
		}
	}
    console.log("selected item's index: " + checked_index + "\n" + "item value: " + checked_value);
	// alert( '선택된 항목 인덱스: '+checked_index+'\n선택된 항목 값: '+checked_value );
    return checked_value;
}
