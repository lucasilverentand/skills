# Terminology and layout
HomeKit structures the home as a hierarchy of objects and provides specific terminology for these entities. The Home app leverages this HomeKit object model and vocabulary to enable intuitive control of devices via voice, application, and automation.

It is essential that your app utilizes the terminology and object model defined by HomeKit to reinforce users' understanding and make home automation accessible.

In the HomeKit model, the [home](#Homes) object serves as the root of a hierarchy containing all other objects, such as [rooms](#Rooms), [accessories](#Accessories-services-and-characteristics), and [zones](#Zones). If a user has multiple homes, each home constitutes the root of a separate hierarchy.

- **Acknowledge the hierarchical model that HomeKit uses.** Even if your application does not organize devices by rooms and zones in its interface, referencing the HomeKit model is beneficial when assisting users with setup or control. Users need to know an accessory's location so they can use Siri and HomePod commands like, “Siri, turn on the lights upstairs,” or “It’s dark in here.” For further guidance, consult [Siri interactions](#Siri-interactions).
- **Make it easy for people to find an accessory’s related HomeKit details.** If your app's organization is device-centric, do not obscure other HomeKit data—such as an accessory’s zone or room—in a difficult-to-find settings menu. Instead, consider making this related HomeKit information readily accessible within the accessory's detail view.
- **Recognize that people can have more than one home.** Even if your app does not support the concept of multiple homes per user, consider including relevant home information in an accessory detail view.
- **Don’t present duplicate home settings.** If your app offers a different perspective on how a home is organized, do not confuse users by requiring them to set up or view parts of their home again, nor should you display a duplicate settings screen. Always defer to the configurations established in the Home app and find an intuitive way to present these details within your UI.

#### Homes
HomeKit utilizes the term `*home*` to denote a physical residence, office, or any other location significant to its users. An individual may be associated with multiple homes.

#### Rooms
A `Room` object corresponds to a physical space within a residence. These rooms serve as meaningful identifiers for users (e.g., *Bedroom* or *Office*) and do not possess inherent attributes such as size or geographical placement. When accessories are grouped into a room, users can control them using voice commands like "Siri, turn on all the lights except the bedroom," or "Siri, turn on the kitchen and hallway lights."

#### Accessories, services, and characteristics
The term *accessory* refers to a physical, connected home device, such as a camera, lock, lamp, or ceiling fan. HomeKit employs the term *category* to classify a type of accessory (e.g., thermostat, fan, or light). While manufacturers usually assign an accessory to a category, your application may assist users in making this assignment. For instance, a switch connected to a fan or lamp must be assigned the same category as the device it manages.

A *service* is a controllable function within an accessory, like the switch controlling a connected light. Some accessories provide multiple services; for example, a garage door might allow separate control of the light and the door, or an outlet may support distinct control for its top and bottom sockets. Applications should not display the word *service* in the user interface; rather, they must use descriptive names like *garage door opener* or *ceiling fan light*. When users employ Siri to manage their home devices, they reference the service name, not the accessory name. For further guidance on naming conventions, consult [Help people choose useful names](#Help-people-choose-useful-names).

A *characteristic* defines a controllable property of a service. For example, the fan service on a ceiling fan might include a speed characteristic, while the light service includes a brightness characteristic. Applications should not use the term *characteristic* in the UI; instead, they should utilize attribute descriptions such as *speed* or *brightness*.

A *service group* allows a collection of accessory services to be managed as a single unit. If, for instance, a room contains a floor lamp and two table lamps, users might group these three services under the name *reading lamps*. This enables users to control those three lights using the *reading lamps* service group, independent of any other lighting in the room.

#### Actions and scenes
The term *action* describes modifying a service's attribute, such as altering fan speed or light brightness. Actions can be initiated by users or automated workflows.

A *scene* is a compilation of actions that govern one or more services across different accessories. For instance, users might configure a *Movie Time* scene to dim lights and lower shades, or a *Good Morning* scene to activate the lights, raise the shades, and start the kitchen coffee maker.

> **Tip**
> Although the HomeKit API utilizes the term *action set*, your application's UI must exclusively use the term *scene*.

#### Automations
Automations allow accessories to react when specific conditions occur. These situations include a change in a person's location, the occurrence of a particular time, another accessory changing its power state (on or off), or a sensor detecting an event. For example, an automation can activate the house lights at sunset or when residents arrive home.

#### Zones
A zone defines a physical area within the home that includes multiple rooms, such as *upstairs* or *downstairs*. Although creating a zone is not required, it enables users to manage numerous accessories concurrently. For example, if all downstairs lights are grouped into a zone named *downstairs*, users can issue voice commands like, “Siri, turn off all the lights downstairs.”
