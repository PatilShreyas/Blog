---
template: BlogPost
path: /firestore-pagination-in-android-using-firebaseui-library
date: 2019-07-21T16:24:21.578Z
title: "Firestore Pagination in Android — Using FirebaseUI Library \U0001F525"
metaDescription: >-
  Hi everyone, In this article, we will learn to implement Paging support for
  Firestore Database in Android. Before starting to the topic, Let’s first take
  a look at the available components within the Firebase.
metaKeywords: 'android, firebase, firestore, paging adapter, pagination, firebaseui'
thumbnail: /assets/FirestorePagination.png
---
# Firestore Pagination in Android — Using FirebaseUI Library 🔥

Hi everyone, In this article, we will learn to implement *Paging support* for *Firestore Database* in Android. Before starting to the topic, Let’s first take a look at the available components within the Firebase.

**FirebaseUI-Android** library has **FirestoreRecyclerAdapter** for easy implementation of the population of **Firestore Database**. But if the database is having a total number of children in thousands or around then it becomes a bad presentation of User Interface. Let’s take an example if you are implementing social media app and you are having around 100 Posts. If we load these Posts using *FirestoreRecyclerAdapter* then it will load all the Posts at the time of loading. So, this will be wastage of memory or hectic for the user to scroll down with a large list or it is not good to present in front of the application user. To overcome this, we will use pagination which will load Firestore Database document items in pages.

This API is available on [this](https://github.com/firebase/FirebaseUI-Android/tree/master/firestore) official **FirebaseUI** ’s GitHub repository.

`FirestorePagingAdapter`— binds a `Query` to a `RecyclerView `by loading data in pages. Best used with large, static data sets. Real-time events are not respected by this adapter, so it will not detect new/removed items or changes to items already loaded. The `FirestorePagingAdapter` is built on top of the [Android Paging Support Library](https://developer.android.com/topic/libraries/architecture/paging.html).

**See Output:**

![](/assets/firestore-demo.gif)

# 💻 Getting Started :

Let’s get started to the code!

Open *Android Studio.* Create a new project OR you can simply *clone this repository:* <https://github.com/PatilShreyas/FirestorePagingDemo-Android>

First of all, go to Firebase Console and create a new Android Project. Download configuration file i.e. `google-services.json`and place it in the **/app** directory.

In this app, you are showing a paginated list of Posts. Posts will load in`RecyclerView.`

## Gradle Setup

In the app module of`build.gradle` include following dependencies.

```groovy
    // RecyclerView
    implementation 'androidx.recyclerview:recyclerview:1.0.0'

    // Firebase & Firestore SDK
    implementation 'com.google.firebase:firebase-core:17.0.1'
    implementation 'com.google.firebase:firebase-firestore:20.1.0'

    // Firestore FirebaseUI Library
    implementation 'com.firebaseui:firebase-ui-firestore:5.0.0'

    // Paging Library
    implementation 'android.arch.paging:runtime:1.0.1'
```

## App Setup

Make model class (Consider`Post.java`) in the app.

```kotlin
data class Post(
    var authorName: String? = null,
    var message: String? = null
)
```

Then, create a`ViewHolder`class by inheriting`RecyclerView.ViewHolder`as below.

```kotlin
class PostViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

    private var authorView: TextView = itemView.findViewById(R.id.post_AuthorName)
    private var messageView: TextView = itemView.findViewById(R.id.post_Message)

    fun bind(post: Post) {
        authorView.text = post.authorName
        messageView.text = post.message
    }
}
```

# Initialize :

Don’t forget to set `LayoutManager` to the RecyclerView.\
Set it using`RecyclerView#setLayoutManager()`*.*

## Setup Configuration for PagedList

First of all configure PagedList\
*Remember that, the size you will pass to *`setPageSize()`* a method will load x3 items of that size at first load.* (Here, in this example we passed value 10. So, it will load 10x3 i.e. 30 items at first load).

```kotlin
 // Init Paging Configuration
val config = PagedList.Config.Builder()
    .setEnablePlaceholders(false)
    .setPrefetchDistance(2)
    .setPageSize(10)
    .build()
```

Then Configure Adapter by building FirestorePagingOptions. It will generic.\
*Remember one thing,* This query should only contain `where()` and `orderBy()`clauses. Any `limit()`or pagination clauses will cause errors.

```kotlin
// Init Adapter Configuration
val options = FirestorePagingOptions.Builder<Post>()
    .setLifecycleOwner(this)
    .setQuery(mQuery, config, Post::class.java)
    .build()
```

## Initialize Adapter

`FirestorePagingAdapter` is built on the top of Android Architecture Components - Paging Support Library. To implement, you should already have `RecyclerView.ViewHolder`subclass. Here We used `PostViewHolder` class.

```kotlin
// Instantiate Paging Adapter
mAdapter = object : FirestorePagingAdapter<Post, PostViewHolder>(options) {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostViewHolder {
        val view = layoutInflater.inflate(R.layout.item_post, parent, false)
        return PostViewHolder(view)
    }

    override fun onBindViewHolder(viewHolder: PostViewHolder, position: Int, post: Post) {
        // Bind to ViewHolder
        viewHolder.bind(post)
    }

    override fun onError(e: Exception) {
        super.onError(e)
        Log.e("MainActivity", e.message)
    }

    override fun onLoadingStateChanged(state: LoadingState) {
        when (state) {
            LoadingState.LOADING_INITIAL -> {
                swipeRefreshLayout.isRefreshing = true
            }

            LoadingState.LOADING_MORE -> {
                swipeRefreshLayout.isRefreshing = true
            }

            LoadingState.LOADED -> {
                swipeRefreshLayout.isRefreshing = false
            }

            LoadingState.ERROR -> {
                Toast.makeText(
                    applicationContext,
                    "Error Occurred!",
                    Toast.LENGTH_SHORT
                ).show()
                swipeRefreshLayout.isRefreshing = false
            }

            LoadingState.FINISHED -> {
                swipeRefreshLayout.isRefreshing = false
            }
        }
    }
}
```

Any changes that occur in the adapter will result in the callback `onLoadingStateChanged()`

## Error Handling

To get to know about Errors caught during Paging, Override method `onError()` in the adapter.

```kotlin
override fun onError(e: Exception) {
    super.onError(e)
    Log.e("MainActivity", e.message)
  
  // Handle the Error.
}
```

## Retrying List (After Error / Failure)

To retry items loading in RecyclerView, `retry()` method from Adapter class is used.\
Use it as`FirestorePagingAdapter#retry()`.\
This method should be used only after caught in Error. `retry()`should not be invoked anytime other than ERROR state.\
Whenever `LoadingState` becomes `LoadingState.ERROR` we can use`retry()`to load items in RecyclerView which were unable to load due to recent failure/error and to maintain Paging List stable.\
See the demo for a method.

```kotlin
mAdapter.retry();
```

## Refreshing List

To refresh items in RecyclerView, `refresh()` method from Adapter class is used.\
Use it as `FirestorePagingAdapter#refresh()`.\
This method clears all the items in RecyclerView and reloads the data again from the beginning.\
See the demo for a method.

```kotlin
// Refresh Action on Swipe Refresh Layout
swipeRefreshLayout.setOnRefreshListener {
    mAdapter.refresh()
}
```

## Set Adapter

Finally, Set adapter to the`RecyclerView`.

```kotlin
recyclerView.adapter = mAdapter
```

## Lifecycle

At last, To begin populating data, call`startListening()` method.`stopListening()` stops the data being loaded.

To begin populating data, call the `startListening()` method. You may want to call this in your `onStart()` method. Make sure you have finished any authentication necessary to read the data before calling `startListening()` or your query will fail.

```kotlin
override fun onStart() {
    super.onStart()
    mAdapter.startListening()
}
```

Similarly, the `stopListening()`call freezes the data in the `RecyclerView` and prevents any future loading of data pages.

Call this method when the containing Activity or Fragment stops:

Stop Lifecycle of the Adapter

> *Thus, we have implemented the **FirestoreRecycler Pagination**. 😃*

You can see the *full app demo* on below-listed resources with source code and step-by-step guide.

Please have a clap for this article if you found it helpful!

***Thank You!*😃**
