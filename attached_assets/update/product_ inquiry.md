in addition to "product_sales" and "product_listing" the goal is to add a new business type "product_inquiry", when a business profile is set to "product_inquiry", 
1. product prices in both the product list and product details will not be visable,  
2. customer will still be able to add product to cart, but the price total will be disabled when setting quantity.
3. the shopping cart will have a few changes 
    a. in customer info the name input field will remain for the customer to enter their name, all prices will be disabled
    b. delivery option will no longer be connected to the profile sheet's delivery options but instead have a dropdown of the following options "pickup", "island wide delivery" and "overseas shipping",
     - for pickup the user will need to enter pickup date and time,
     - for "island wide delivery" user will 2 input fields, input field #1 parish input field to indicate which parish they are located in, input field #2 the address to indicate their address in the parish that they have entered,
     - for "overseas shipping" the user will get 2 input field, input field #1 country input field, to indicate the country they are located in(if "jamaica" is entered in either upper or lower case, the use should get error popup saying please choose "island wide delivery"), input field #2 the address to indicate their address in the country they have entered. 
4. order summary will be disabled.
5. the "send order via whatsapp" button will now be the "send inquiry via whatsapp" button
6. when the "send inquiry via whatsapp" button is pressed and the message is genrated in whatapp is should now state:
    - a. for "pickup" it will say - " hello 'business name' could you please provide the price for the following 'the selected products' i would like pickup on 'pickup date and time"  
    - b. for "island wide delivery" it will say - " hello 'business name' could you please provide the price for the following 'the selected products' along with the price to have it delivered to 'delivery address' in the parish of 'entered parish'  
    - c. for "overseas shipping" it will say - " hello 'business name' could you please provide the price for the following 'the selected products' along with the price to have it delivered to 'delivery address' in 'entered country'

7. in business profile the "delivery information will auto change and only display "delivery available" and the info below will will state "delivery option available in inquiry"




1. Shopping cart changes:
   - Customer info section will retain name input field, but all prices will be disabled
   - Delivery options will be replaced with a dropdown containing: "pickup", "island wide delivery", and "overseas shipping"
   - Each delivery option will have specific input fields:
     - Pickup: Date and time input
     - Island wide delivery: Parish input and address input
     - Overseas shipping: Country input (with validation for "Jamaica" if "jamaica" is entered in either upper or lower case, the use should get error popup saying please choose "island wide delivery") and address input
2. WhatsApp message format will change based on delivery option:
   - Pickup: "Hello [business name], could you please provide the price for the following [selected products]. I would like pickup on [pickup date and time]"
   - Island wide delivery: "Hello [business name], could you please provide the price for the following [selected products] along with the price to have it delivered to [delivery address] in the parish of [entered parish]"
   - Overseas shipping: "Hello [business name], could you please provide the price for the following [selected products] along with the price to have it delivered to [delivery address] in [entered country]"
3. Business profile delivery information will display "Delivery available" with info stating "Delivery option available in inquiry"



when the business profile is set to product_sales i want to also add the "overseas shipping" option similar to product_inquiry, where the customer will have the total price of the product, but inquire about the price for "overseas shipping", so when the business profile is set to product_sales and the user selects "overseas shipping", the user will get a Country input field (with validation for "Jamaica" if "jamaica" is entered in either upper or lower case, the use should get error popup saying please choose "island wide delivery") and address input field, 
and the WhatsApp message format  for overseas shipping will be:
"Hello [business name], i would like to order [selected products] and also would like to know the price to have it delivered to [delivery address] in [entered country]"


lets add a username popup dialog box widget that pops up when the app opens and no username is detected, when this dialog box pops up the user can enter a username and press save, this dialog box will remain persistent untill a username is created, and if the app opens and a username is already created the app will function as normal,   