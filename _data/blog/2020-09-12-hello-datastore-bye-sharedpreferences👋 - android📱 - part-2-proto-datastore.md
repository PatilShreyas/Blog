---
template: BlogPost
path: /hello-datastore-bye-sharedpreferences-android-proto-datastore
date: 2020-09-12T13:30:15.709Z
title: "Hello DataStore, Bye SharedPreferences\U0001F44B - Android\U0001F4F1 - Part 2: Proto DataStore"
metaDescription: "In this article series, we'll learn how to use the Proto DataStore for storing type based objects. DataStore is the latest Android Jetpack \U0001F680 library which will replace SharedPreferences."
metaKeywords: >-
  android, datastore, androidx datastore, android datastore, proto, protobuf,
  sharedpreferences, kotlin, kotlin coroutine, flow
thumbnail: /assets/datastore-proto.png
---
# Hello DataStore, Bye SharedPreferences👋 — Android📱 — Part 2: Proto DataStore

Welcome Android Developers 👋. In [the previous article](https://blog.shreyaspatil.dev/hello-datastore-bye-sharedpreferences-android), we saw how to use Preference DataStore to store key-value pairs. But it is not type-safe, Right? We’ll be covering that part in this article 😃. If you missed the previous article then you can read it 👇

[Hello DataStore, Bye SharedPreferences - Android - Part 1 - Preference DataStore](https://blog.shreyaspatil.dev/hello-datastore-bye-sharedpreferences-android)

#### What is Proto DataStore? 🤷‍♂

* It stores instances as custom data.
* Defines schema using [Protocol buffers](https://developers.google.com/protocol-buffers).
* They are faster, smaller, simpler, and less ambiguous than XML and other similar data formats.

That’s enough introduction for Proto DataStore to get started… It’s time to write some code👨‍💻😎.

- - -

### Let’s begin code 👨‍💻

You can simply [clone or refer this repository](https://github.com/PatilShreyas/DataStoreExample) to get example code demonstrating DataStore.

What we’ll be implementing? So we’ll be developing a *Food* app 😋 where a list of food items will be displayed and we’ll provide a filter to the user for food preference options. Like Food type as 🟢***VEG*** or 🔴***NON-VEG***and Food taste as ***SWEET*** or ***SPICY***😋. So that user can filter his favourite food according to his choice. You can see a demo here. This is how it’ll be look alike👇.

![An example application using Proto DataStore](/assets/proto-datastore-app-demo.gif "An example application using Proto DataStore")

Ok great! You might have got the idea of this app. First of all, we’ll need to add some dependencies for proto DataStore 👇

#### Add plugin and dependencies

Open `build.gradle` of your app module and add plugin at the top of the file and proto Datastore, Google Protobuf dependencies and then configure *protobuf*.

```groovy
plugins {
    ...
    id "com.google.protobuf" version "0.8.12"
}

dependencies {
    ...
    // Proto DataStore
    implementation  "androidx.datastore:datastore-core:1.0.0-alpha01"

    // Protobuf
    implementation  "com.google.protobuf:protobuf-javalite:3.11.0"
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.11.0"
    }
  
    generateProtoTasks {
        all().each { task ->
            task.builtins {
                java {
                    option 'lite'
                }
            }
        }
    }
}
```

As you have seen above, we’ll have a list of food items. So let’s create a model for `Food`

```kotlin
data class Food(
    val name: String,
    val type: FoodType,
    val taste: FoodTaste
)

enum class FoodTaste {
    SWEET, SPICY
}

enum class FoodType {
    VEG, NON_VEG
}
```

Here we’ll also create another class i.e. `UserFoodPreference` which will be stored in DataStore. This model will be provided *(or exposed)* whenever preference is changed.

```kotlin
data class UserFoodPreference(
    val type: FoodType?,
    val taste: FoodTaste?
)
```

> As you can see 👆 We’ve kept field nullable which means if they’re null then we can assume that user hasn’t set any filter or preference for food.

#### Define Protobuf

* Now we can’t directly store this model as it is using Proto DataStore. We’ll need to define a schema in a *proto* file.
* Create a new file called `food_preference.proto` in the path `app/src/main/proto` as following 👇 (*See [this](https://developers.google.com/protocol-buffers/docs/overview) for syntax guide*).

```protobuf
syntax = "proto3";

option java_package = "dev.shreyaspatil.datastore.example.proto";
option java_multiple_files = true;

message FoodPreferences {
    enum FoodType {
        TYPE_UNSPECIFIED = 0;
        TYPE_VEG = 1;
        TYPE_NON_VEG = 2;
    }

    enum FoodTaste {
        TASTE_UNSPECIFIED = 0;
        TASTE_SWEET = 1;
        TASTE_SPICY = 2;
    }

    FoodType type = 1;
    FoodTaste taste = 2;
}
```

As you can see 👆, we have created a schema in proto.

> Whenever a value is not specified then `XXX_UNSPECIFIED` will be the default value here.

Once you’re done with the above step, ***Rebuild*** your Gradle project. You’ll see that `FoodPreference.java` will be automatically generated from the above proto schema.

#### Make Serializer for Proto class

You’ll need to create a serializer for your proto generated class. Because Proto DataStore requires serializer field which serializes/deserializes proto objects. You can create it as follows 👇

```kotlin
object FoodPreferenceSerializer : Serializer<FoodPreferences> {
    override fun readFrom(input: InputStream): FoodPreferences {
        try {
            return FoodPreferences.parseFrom(input)
        } catch (exception: InvalidProtocolBufferException) {
            throw CorruptionException("Cannot read proto.", exception)
        }
    }

    override fun writeTo(t: FoodPreferences, output: OutputStream) = t.writeTo(output)
}
```

#### Create Food Preference Manager

Great! Now we’ll set up our Food Preference Manager which will store user food preferences (where we’ll actually implement Proto DataStore). Create a new class — `FoodPreferenceManager`. Here you’ll need to provide a filename for DataStore as well as *serializer object for proto* which we created recently.

```kotlin
class FoodPreferenceManager(context: Context) {
    private val dataStore: DataStore<FoodPreferences> =
        context.createDataStore(
            fileName = "food_prefs.pb",
            serializer = FoodPreferenceSerializer
        )
    ....
```

Now we’ll create two functions for setting or changing preferences.

1. **For Food type preference**

```kotlin
    suspend fun updateUserFoodTypePreference(type: FoodType?) {
        val foodType = when (type) {
            FoodType.VEG -> FoodPreferences.FoodType.TYPE_VEG
            FoodType.NON_VEG -> FoodPreferences.FoodType.TYPE_NON_VEG
            null -> FoodPreferences.FoodType.TYPE_UNSPECIFIED
        }

        dataStore.updateData { preferences ->
            preferences.toBuilder()
                .setType(foodType)
                .build()
        }
    }
```

2. **For Food taste preference**

```kotlin
    suspend fun updateUserFoodTastePreference(taste: FoodTaste?) {
        val foodTaste = when (taste) {
            FoodTaste.SWEET -> FoodPreferences.FoodTaste.TASTE_SWEET
            FoodTaste.SPICY -> FoodPreferences.FoodTaste.TASTE_SPICY
            null -> FoodPreferences.FoodTaste.TASTE_UNSPECIFIED
        }

        dataStore.updateData { preferences ->
            preferences.toBuilder()
                .setTaste(foodTaste)
                .build()
        }
    }
```

As you can see in the above methods. We have mapped our `FoodType` or `FoodTaste` to the proto generated enums. That’s all about setting or changing preferences.

Now we’ll need to expose a `Flow` for observing user food preferences. We’ll map DataStore preferences to the data class which we earlier created i.e. `UserFoodPreference`.

```kotlin
    val userFoodPreference = dataStore.data.catch {
        if (it is IOException) {
            Log.e(TAG, "Error reading sort order preferences.", it)
            emit(FoodPreferences.getDefaultInstance())
        } else {
            throw it
        }
    }.map {
        val type = when (it.type) {
            FoodPreferences.FoodType.TYPE_VEG -> FoodType.VEG
            FoodPreferences.FoodType.TYPE_NON_VEG -> FoodType.NON_VEG
            else -> null
        }
        val taste = when (it.taste) {
            FoodPreferences.FoodTaste.TASTE_SWEET -> FoodTaste.SWEET
            FoodPreferences.FoodTaste.TASTE_SPICY -> FoodTaste.SPICY
            else -> null
        }

        UserFoodPreference(type, taste)
    }
```

That’s all about `FoodPreferenceManager` 😃. Now let’s implement it in our UI.

- - -

#### Set up Activity

Here I’ll assume that you’re implementing this app with `RecyclerView` in `Activity` and you’ve implemented `ViewModel` for getting data i.e. list of food items from *Repository. (For demo purposes, here I’ve created a sample DataSource which gives a dummy list of food items).*So I’ll directly show you implementation related to *DataStore*. You can refer to ***[this](https://github.com/PatilShreyas/DataStoreExample/blob/master/app/src/main/java/dev/shreyaspatil/datastore/example/proto/ProtoDatastoreActivity.kt)*** class for more information.

So let’s make *Activity*

```kotlin
class ProtoDatastoreActivity : AppCompatActivity() {

    private lateinit var foodPreferenceManager: FoodPreferenceManager

    private val foodListAdapter by lazy { FoodListAdapter() }
```

> **Note:** Here `foodListAdapter`is a `RecyclerView.Adapter`’s implementation

Now, whenever Chips are clicked by the user then preferences should be stored or updated in DataStore. So let’s do that 👇

```kotlin
    private fun initViews() {
        foodTaste.setOnCheckedChangeListener { group, checkedId ->
            val taste = when (checkedId) {
                R.id.sweet -> FoodTaste.SWEET
                R.id.spicy -> FoodTaste.SPICY
                else -> null
            }

            lifecycleScope.launch { foodPreferenceManager.updateUserFoodTastePreference(taste) }
        }

        foodType.setOnCheckedChangeListener { group, checkedId ->
            val type = when (checkedId) {
                R.id.veg -> FoodType.VEG
                R.id.nonVeg -> FoodType.NON_VEG
                else -> null
            }

            lifecycleScope.launch { foodPreferenceManager.updateUserFoodTypePreference(type) }
        }
    }
```

Now we should be able to observe the changes in food preference so that we can filter the list accordingly. We already had exposed a `Flow` which gives us `UserFoodPreference` whenever it’s updated. So it’s time to use that 👀.

> **Note:** Here we have used `asLiveData()` extension function of `Flow`. Otherwise, we can also use `lifecycleScope`. This is generally useful when we’re actually implementing with `ViewModel`.

Now the implementation of `filterFoodList()`should look like follows 👇

```kotlin
    private fun filterFoodList(type: FoodType?, taste: FoodTaste?) {
        var filteredList = getFoodList()
        type?.let { foodType ->
            filteredList = filteredList.filter { it.type == foodType }
        }
        taste?.let { foodTaste ->
            filteredList = filteredList.filter { it.taste == foodTaste }
        }

        foodListAdapter.submitList(filteredList)

        if (filteredList.isEmpty()) {
            Toast.makeText(this, "No results!", Toast.LENGTH_SHORT).show()
        }

        updateViews(type, taste)
    }
```

- - -

Yeah! That’s it 😍. We have implemented Proto DataStore now. If you run the app, you’ll see the output as you have seen at the starting of this article 🚀.

- - -

So that was about Proto DataStore. I hope you enjoyed this article or liked it! 😃.

Thank you! 😃

- - -

### Resources

* *[PatilShreyas/DataStoreExample](https://github.com/PatilShreyas/DataStoreExample)*
* *[Hello DataStore, Bye SharedPreferences - Android - Part 1 - Preference DataStore](https://blog.shreyaspatil.dev/hello-datastore-bye-sharedpreferences-android)*
* *[DataStore | Android Developer](https://developer.android.com/topic/libraries/architecture/datastore)*
