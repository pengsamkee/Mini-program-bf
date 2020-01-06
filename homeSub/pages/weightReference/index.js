"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WeightReference = (function () {
    function WeightReference() {
        this.data = {
            mock: [
                {
                    name: 'a',
                    id: 1,
                    data: [
                        { text: '荤菜100克' },
                        { text: '荤菜200克' },
                        { text: '荤菜300克' }
                    ]
                },
                {
                    name: 'b',
                    id: 2,
                    data: [
                        { text: '荤菜1100克' },
                        { text: '荤菜2100克' },
                        { text: '荤菜3100克' }
                    ]
                },
                {
                    name: 'ac',
                    id: 3,
                    data: [
                        { text: '荤菜11100克' },
                        { text: '荤菜21100克' },
                        { text: '荤菜31100克' }
                    ]
                },
            ],
            choosedIndex: 0,
        };
    }
    WeightReference.prototype.onLoad = function (options) {
        console.log(999);
    };
    WeightReference.prototype.handleChooseCategory = function (e) {
        var choosedIndex = e.currentTarget.dataset.index;
        this.setData({ choosedIndex: choosedIndex });
    };
    return WeightReference;
}());
Page(new WeightReference());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBO0lBQUE7UUFFUyxTQUFJLEdBQUc7WUFDWixJQUFJLEVBQUM7Z0JBQ0Q7b0JBQ0ksSUFBSSxFQUFDLEdBQUc7b0JBQ1IsRUFBRSxFQUFDLENBQUM7b0JBQ0osSUFBSSxFQUFDO3dCQUNELEVBQUUsSUFBSSxFQUFDLFFBQVEsRUFBRTt3QkFDakIsRUFBRSxJQUFJLEVBQUMsUUFBUSxFQUFFO3dCQUNqQixFQUFFLElBQUksRUFBQyxRQUFRLEVBQUU7cUJBQ3BCO2lCQUNKO2dCQUNEO29CQUNJLElBQUksRUFBQyxHQUFHO29CQUNSLEVBQUUsRUFBQyxDQUFDO29CQUNKLElBQUksRUFBQzt3QkFDRCxFQUFFLElBQUksRUFBQyxTQUFTLEVBQUU7d0JBQ2xCLEVBQUUsSUFBSSxFQUFDLFNBQVMsRUFBRTt3QkFDbEIsRUFBRSxJQUFJLEVBQUMsU0FBUyxFQUFFO3FCQUNyQjtpQkFDSjtnQkFDRDtvQkFDSSxJQUFJLEVBQUMsSUFBSTtvQkFDVCxFQUFFLEVBQUMsQ0FBQztvQkFDSixJQUFJLEVBQUM7d0JBQ0QsRUFBRSxJQUFJLEVBQUMsVUFBVSxFQUFFO3dCQUNuQixFQUFFLElBQUksRUFBQyxVQUFVLEVBQUU7d0JBQ25CLEVBQUUsSUFBSSxFQUFDLFVBQVUsRUFBRTtxQkFDdEI7aUJBQ0o7YUFDSjtZQUNELFlBQVksRUFBQyxDQUFDO1NBQ2YsQ0FBQTtJQVVILENBQUM7SUFSUSxnQ0FBTSxHQUFiLFVBQWMsT0FBVztRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2xCLENBQUM7SUFDTSw4Q0FBb0IsR0FBM0IsVUFBNEIsQ0FBSztRQUMvQixJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDbEQsSUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFSCxzQkFBQztBQUFELENBQUMsQUEzQ0QsSUEyQ0M7QUFFRCxJQUFJLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgcmVxdWVzdCBmcm9tICcuLi8uLi8uLi9hcGkvYXBwL2ludGVyZmFjZSc7XG5cbmNsYXNzIFdlaWdodFJlZmVyZW5jZSB7XG5cbiAgcHVibGljIGRhdGEgPSB7XG4gICAgbW9jazpbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6J2EnLFxuICAgICAgICAgICAgaWQ6MSxcbiAgICAgICAgICAgIGRhdGE6W1xuICAgICAgICAgICAgICAgIHsgdGV4dDon6I2k6I+cMTAw5YWLJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDon6I2k6I+cMjAw5YWLJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDon6I2k6I+cMzAw5YWLJyB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6J2InLFxuICAgICAgICAgICAgaWQ6MixcbiAgICAgICAgICAgIGRhdGE6W1xuICAgICAgICAgICAgICAgIHsgdGV4dDon6I2k6I+cMTEwMOWFiycgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6J+iNpOiPnDIxMDDlhYsnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OifojaToj5wzMTAw5YWLJyB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6J2FjJyxcbiAgICAgICAgICAgIGlkOjMsXG4gICAgICAgICAgICBkYXRhOltcbiAgICAgICAgICAgICAgICB7IHRleHQ6J+iNpOiPnDExMTAw5YWLJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDon6I2k6I+cMjExMDDlhYsnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OifojaToj5wzMTEwMOWFiycgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgIF0sXG4gICAgY2hvb3NlZEluZGV4OjAsXG4gIH1cblxuICBwdWJsaWMgb25Mb2FkKG9wdGlvbnM6YW55KSB7XG4gICAgY29uc29sZS5sb2coOTk5KVxuICB9XG4gIHB1YmxpYyBoYW5kbGVDaG9vc2VDYXRlZ29yeShlOmFueSl7XG4gICAgY29uc3QgY2hvb3NlZEluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQuaW5kZXg7XG4gICAgKHRoaXMgYXMgYW55KS5zZXREYXRhKHtjaG9vc2VkSW5kZXg6Y2hvb3NlZEluZGV4fSlcbiAgfVxuICBcbn1cblxuUGFnZShuZXcgV2VpZ2h0UmVmZXJlbmNlKCkpXG4iXX0=