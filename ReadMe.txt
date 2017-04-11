# SPARQL Cabinet Application
	It is a web application, which allows its users to find, create, edit, and delete SPARQL queries. It is developed using Visual Studio IDE and KnockoutJs.


# Getting Started
	As requested, the project is shared as a patch file.
	Use command "git apply solution.patch".


# Prerequisites
	Just a Web browser is required. The application is developed in Chrome so its preferable.
	To view the project properly in Visual Studio. Open the Solution file in base folder.
	To get the free community version go to: https://www.visualstudio.com/vs/community/


# Executing the Application
	Open the file "common.html" with Chrome browser. 
	It is placed at following path "SPARQLCabinetApplication\SPARQLCabinetApplication\Views\"

	
# Basic Features: 
		1. Display list of all queries.
		2. View a single query.
		3. Edit/Update a query.
		4. Delete a query.
		5. Create a new query.
		
# Additional Features: 		
	1. Loading Gif: Has a loading gif for the duration of Ajax Call. - May not be visible due to high internet speeds :)
	2. Real-time Search functionality: Filters list at real-time on the basis of search text depending upon each column.
	3. Social Networking Buttons: Facebook, Gmail, LinkedIn buttons are added in footer to contact author.
	4. Table Hover: Hover mouse on table columns to view the full data. Normally it shoes ellipsis is case where data is large than column width.
	5. Sorting: The table data will be sorted alphabetically by "ID".
	5. Informational Messages: Use of Toastr.js to display success and error messages.
	6. Confirmation Box: Use of Bootbox.js to display confirmation box while leaving edit page and deleting any query.
	7. Regex and Required Validation: It is applied on Id field to restrict special characters except underscore and dash. Elsewhere required validation is applied.
		

# Authors
	Yogesh Tiwari [https://www.linkedin.com/in/yogeshtiwari1990/]

	
# Acknowledgments
	Thank you to StackOverflow website and the people providing the solutions.
