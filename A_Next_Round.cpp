#include<iostream>
using namespace std;

int main() {
   
   
    int n,k;
    cin >> n>>k;
    int arr[n+1];
    for (int i = 1; i <= n; i++) {
        cin >> arr[i];
    }
    int cnt=0;
    for (int i = 1; i <= n; i++) {
        if (arr[i] >= arr[k] && arr[i] > 0) {
            cnt++;
        }

    }
    cout << cnt << endl;
    
    return 0;
}