// Real Pulso screens with isolated repositories for the portfolio recording.
import 'dart:async';
import 'dart:convert';
import 'dart:js_interop';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pulso/main.dart' show MyApp;
import 'package:pulso/auth/auth_repository.dart';
import 'package:pulso/post/post_model.dart';
import 'package:pulso/post/post_repository.dart';
import 'package:pulso/profile/profile_model.dart';
import 'package:pulso/profile/profile_repository.dart';
import 'package:pulso/like/like_repository.dart';
import 'package:pulso/bookmark/bookmark_repository.dart';
import 'package:pulso/follow/follow_repository.dart';
import 'package:pulso/story/story_repository.dart';
import 'package:pulso/story/story_model.dart';
import 'package:pulso/notification/notification_repository.dart';
import 'package:pulso/notification/notification_model.dart';
import 'package:pulso/comment/comment_repository.dart';
import 'package:pulso/providers/auth_providers.dart';
import 'package:pulso/providers/post_providers.dart';
import 'package:pulso/providers/profile_providers.dart';
import 'package:pulso/providers/like_providers.dart';
import 'package:pulso/providers/bookmark_providers.dart';
import 'package:pulso/providers/follow_providers.dart';
import 'package:pulso/providers/story_providers.dart';
import 'package:pulso/providers/notification_providers.dart';
import 'package:pulso/providers/comment_providers.dart';
import 'package:pulso/providers/supabase_providers.dart';

@JS('window.pulsoDemoState')
external set demoState(JSString value);
final events=<String>[];
bool signedIn=false;
final saved=<String>{};
final liked=<String>{};
final stamp=DateTime(2026,10,24,9,30);
var profile=ProfileModel(id:'me',username:'jay.demo',displayName:'Jay',bio:'Building and sharing with the community.',createdAt:stamp,updatedAt:stamp);
final posts=<PostModel>[
 PostModel(id:'welcome',userId:'community',caption:'A place to share what you are building.',imageUrl:'',imageUrls:[],createdAt:stamp,updatedAt:stamp,authorUsername:'campus.dev',authorDisplayName:'Campus community',likeCount:24),
];
void report([String? event]) {
 if(event!=null)events.add(event);
 demoState=jsonEncode({'events':events,'signedIn':signedIn,'posts':posts.map((p)=>{'id':p.id,'caption':p.caption,'hasImage':p.imageUrl.isNotEmpty}).toList(),'profile':{'displayName':profile.displayName,'username':profile.username,'bio':profile.bio,'hasAvatar':profile.avatarUrl?.isNotEmpty??false},'saved':saved.toList()}).toJS;
}
void main(){
 WidgetsFlutterBinding.ensureInitialized();report();
 runApp(ProviderScope(overrides:[
  supabaseClientProvider.overrideWithValue(null),
  authRepositoryProvider.overrideWithValue(DemoAuth()),
  postRepositoryProvider.overrideWithValue(DemoPosts()),
  profileRepositoryProvider.overrideWithValue(DemoProfile()),
  likeRepositoryProvider.overrideWithValue(DemoLikes()),
  bookmarkRepositoryProvider.overrideWithValue(DemoBookmarks()),
  followRepositoryProvider.overrideWithValue(DemoFollow()),
  storyRepositoryProvider.overrideWithValue(DemoStories()),
  notificationRepositoryProvider.overrideWithValue(DemoNotifications()),
  commentRepositoryProvider.overrideWithValue(DemoComments()),
 ],child:const MyApp()));
}
class DemoAuth implements AuthRepository {
 final _changes=StreamController<AppAuthSession?>.broadcast();
 @override AppAuthSession? get currentSession=>signedIn?const AppAuthSession(userId:'me',email:'demo@example.com'):null;
 @override Stream<AppAuthSession?> get authStateChanges=>_changes.stream;
 @override Future<void> signIn({required String email,required String password})async{
  if(email!='demo@example.com'||password!='demo-pass-2026')throw StateError('Use the fictional demo account.');
  await Future<void>.delayed(const Duration(milliseconds:450));
  signedIn=true;_changes.add(currentSession);report('signed-in');
 }
 @override Future<void> signUp({required String email,required String password})async{report('sign-up-requested');}
 @override Future<void> signOut()async{signedIn=false;_changes.add(null);report('signed-out');}
}
class DemoPosts implements PostRepository {
 @override Future<List<PostModel>> getPosts(String userId)async=>posts.where((p)=>p.userId==userId).toList();
 @override Future<List<PostModel>> fetchFeed({int limit=20,int offset=0})async=>posts.skip(offset).take(limit).toList();
 @override Future<List<PostModel>> fetchFollowingFeed({required List<String> followingIds,int limit=20,int offset=0})async=>fetchFeed(limit:limit,offset:offset);
 @override Future<List<PostModel>> getPostsByIds(List<String> ids)async=>posts.where((p)=>ids.contains(p.id)).toList();
 @override Future<PostModel> createPost(PostModel post,{List<String> extraImageUrls=const []})async{
  final created=PostModel(id:'demo-photo',userId:post.userId,caption:post.caption,imageUrl:post.imageUrl,imageUrls:[post.imageUrl,...extraImageUrls],createdAt:stamp,updatedAt:stamp,authorUsername:profile.username,authorDisplayName:profile.displayName,authorAvatarUrl:profile.avatarUrl);
  posts.insert(0,created);report('post-created');return created;
 }
 @override Future<String> uploadPostImage(String userId,Uint8List bytes,String mimeType)async{report('post-image-selected');return Uri.dataFromBytes(bytes,mimeType:mimeType).toString();}
 @override Future<List<String>> uploadPostImages(String userId,List<({Uint8List bytes,String mimeType})> images)async=>Future.wait(images.map((image)=>uploadPostImage(userId,image.bytes,image.mimeType)));
 @override Future<void> deletePost(String id)async{posts.removeWhere((p)=>p.id==id);report();}
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Unused demo post operation: ${invocation.memberName}');
}
class DemoProfile implements ProfileRepository {
 @override Future<ProfileModel?> getProfile(String userId)async=>userId=='me'?profile:ProfileModel(id:userId,username:'campus.dev',displayName:'Campus community',createdAt:stamp,updatedAt:stamp);
 @override Future<List<ProfileModel>> searchProfiles(String query)async=>[];
 @override Future<ProfileModel> upsertProfile(ProfileModel value)async{profile=value;report('profile-saved');return profile;}
 @override Future<String> uploadAvatar(String userId,Uint8List bytes,String mimeType)async{report('avatar-selected');return Uri.dataFromBytes(bytes,mimeType:mimeType).toString();}
}
class DemoLikes implements LikeRepository {
 @override Future<bool> toggleLike({required String postId,required String userId})async{if(!liked.add(postId))liked.remove(postId);report('post-liked');return liked.contains(postId);}
 @override Future<bool> isLikedByUser({required String postId,required String userId})async=>liked.contains(postId);
 @override Future<int> likeCount(String postId)async=>(postId=='welcome'?24:0)+(liked.contains(postId)?1:0);
 @override Future<Map<String,int>> likeCountsForPosts(List<String> ids)async=>{for(final id in ids)id:await likeCount(id)};
 @override Future<Set<String>> getLikedPostIdsForUser({required String userId,required List<String> postIds})async=>liked.intersection(postIds.toSet());
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Realtime disabled in local demo');
}
class DemoBookmarks implements BookmarkRepository {
 @override Future<bool> toggleBookmark({required String postId,required String userId})async{if(!saved.add(postId))saved.remove(postId);report('post-saved');return saved.contains(postId);}
 @override Future<List<String>> getAllBookmarkedPostIds({required String userId})async=>saved.toList();
 @override Future<Set<String>> getBookmarkedPostIdsForUser({required String userId,required List<String> postIds})async=>saved.intersection(postIds.toSet());
}
class DemoFollow implements FollowRepository {
 @override Future<int> getFollowerCount(String id)async=>128;
 @override Future<int> getFollowingCount(String id)async=>64;
 @override Future<List<String>> getFollowingIds(String id)async=>['community'];
 @override Future<List<String>> getFollowerIds(String id)async=>[];
 @override Future<bool> isFollowing({required String followerId,required String followingId})async=>false;
 @override Future<List<ProfileModel>> getFollowingProfiles(String id)async=>[];
 @override Future<List<ProfileModel>> getFollowerProfiles(String id)async=>[];
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Unused demo follow operation');
}
class DemoStories implements StoryRepository {
 @override Future<Map<String,List<StoryModel>>> fetchActiveStories({required List<String> followingIds,required String currentUserId})async=>{};
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Stories outside this demo');
}
class DemoNotifications implements NotificationRepository {
 @override Future<List<NotificationModel>> fetchNotifications(String id)async=>[];
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Notifications outside this demo');
}
class DemoComments implements CommentRepository {
 @override Future<int> getCommentCount(String id)async=>0;
 @override Future<Map<String,int>> getCommentCountsForPosts(List<String> ids)async=>{for(final id in ids)id:0};
 @override dynamic noSuchMethod(Invocation invocation)=>throw StateError('Comments outside this demo');
}
