client.declare('./async-script', function() {

	var el = document.getElementById('ichange');

	return {

		changeParagraph: function(text) {
			el.innerHTML = text;
			console.log('paragraph text changed!');
		}
	};
});
